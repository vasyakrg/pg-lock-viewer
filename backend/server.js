const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
	database: process.env.DB_NAME || 'postgres',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	statement_timeout: parseInt(process.env.QUERY_TIMEOUT || '30000'),
});

const queries = {
	lock: fs.readFileSync(path.join(__dirname, 'queries/lock.sql'), 'utf8'),
	lockAndWho: fs.readFileSync(path.join(__dirname, 'queries/lockAndWho.sql'), 'utf8'),
	waiting: fs.readFileSync(path.join(__dirname, 'queries/waiting.sql'), 'utf8'),
};

app.get('/api/queries', (req, res) => {
	res.json({
		queries: [
			{ id: 'lock', name: 'Lock' },
			{ id: 'lockAndWho', name: 'Lock and Who' },
			{ id: 'waiting', name: 'Waiting' },
		],
	});
});

app.post('/api/execute', async (req, res) => {
	const { queryId } = req.body;
	const startTime = Date.now();

	if (!queryId || !queries[queryId]) {
		console.log(`[${new Date().toISOString()}] ERROR: Invalid query ID: ${queryId}`);
		return res.status(400).json({ error: 'Invalid query ID' });
	}

	const queryText = queries[queryId];
	console.log(`[${new Date().toISOString()}] EXECUTE QUERY: ${queryId}`);

	const timeout = parseInt(process.env.QUERY_TIMEOUT || '30000');
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => {
			reject(new Error(`Query timeout after ${timeout}ms`));
		}, timeout);
	});

	try {
		const queryPromise = pool.query(queryText);
		const result = await Promise.race([queryPromise, timeoutPromise]);

		const duration = Date.now() - startTime;
		const rowCount = result.rows ? result.rows.length : 0;
		console.log(
			`[${new Date().toISOString()}] QUERY SUCCESS: ${queryId} | Duration: ${duration}ms | Rows: ${rowCount}`
		);

		const excludedColumns = ['transactionid', 'usename'];
		const filteredColumns = result.fields
			.map(f => f.name)
			.filter(col => !excludedColumns.includes(col.toLowerCase()));

		const processedRows = result.rows.map(row => {
			const processedRow = { ...row };
			if (processedRow.age !== null && processedRow.age !== undefined) {
				if (typeof processedRow.age === 'object') {
					const age = processedRow.age;
					const totalMs = (age.days || 0) * 86400000 +
						(age.hours || 0) * 3600000 +
						(age.minutes || 0) * 60000 +
						Math.floor((age.seconds || 0) * 1000) +
						(age.milliseconds || 0);
					processedRow.age = Math.round(totalMs);
				} else if (typeof processedRow.age === 'string') {
					const match = processedRow.age.match(/(\d+):(\d+):(\d+)\.(\d+)/);
					if (match) {
						const hours = parseInt(match[1]) || 0;
						const minutes = parseInt(match[2]) || 0;
						const seconds = parseFloat(match[3] + '.' + match[4]) || 0;
						processedRow.age = Math.round(hours * 3600000 + minutes * 60000 + seconds * 1000);
					}
				}
			}
			return processedRow;
		});

		res.json({
			success: true,
			rows: processedRows,
			columns: filteredColumns,
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.log(
			`[${new Date().toISOString()}] QUERY ERROR: ${queryId} | Duration: ${duration}ms | Error: ${error.message}`
		);

		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
