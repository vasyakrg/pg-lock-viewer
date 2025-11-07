<template>
  <div class="container">
    <h1>PostgreSQL Lock Viewer</h1>

    <div class="controls">
      <select v-model="selectedQuery" class="query-select">
        <option value="">Выберите запрос</option>
        <option v-for="query in queries" :key="query.id" :value="query.id">
          {{ query.name }}
        </option>
      </select>

      <button @click="executeQuery" :disabled="!selectedQuery || loading" class="execute-btn">
        {{ loading ? "Выполняется..." : "Запустить" }}
      </button>
    </div>

    <div class="result-container">
      <div v-if="error" class="error"><strong>Ошибка:</strong> {{ error }}</div>

      <div v-if="result && result.length > 0" class="result-table">
        <table>
          <thead>
            <tr>
              <th v-for="column in columns" :key="column" :class="{ 'query-column': column.toLowerCase() === 'query' }">
                {{ column }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in result" :key="index">
              <td v-for="column in columns" :key="column" :class="{ 'query-column': column.toLowerCase() === 'query' }">
                {{ formatValue(row[column]) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="export-container">
          <button @click="exportToExcel" class="export-btn">Выгрузить в Excel</button>
        </div>
      </div>

      <div v-if="result && result.length === 0" class="empty">Запрос выполнен успешно, но результатов нет.</div>
    </div>

    <footer class="footer">
      <p>&copy; GGSel LTD</p>
    </footer>
  </div>
</template>

<script>
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  name: "App",
  data() {
    return {
      queries: [],
      selectedQuery: "",
      loading: false,
      result: null,
      columns: [],
      error: null,
    };
  },
  mounted() {
    this.loadQueries();
  },
  methods: {
    async loadQueries() {
      try {
        const response = await axios.get("/api/queries");
        this.queries = response.data.queries;
      } catch (error) {
        this.error = "Не удалось загрузить список запросов: " + error.message;
      }
    },
    async executeQuery() {
      if (!this.selectedQuery) return;

      this.loading = true;
      this.error = null;
      this.result = null;
      this.columns = [];

      try {
        const response = await axios.post("/api/execute", {
          queryId: this.selectedQuery,
        });

        if (response.data.success) {
          this.result = response.data.rows;
          this.columns = response.data.columns;
        } else {
          this.error = response.data.error || "Неизвестная ошибка";
        }
      } catch (error) {
        this.error = error.response?.data?.error || error.message;
      } finally {
        this.loading = false;
      }
    },
    formatValue(value) {
      if (value === null || value === undefined) {
        return "NULL";
      }
      if (typeof value === "object") {
        if (value.milliseconds !== undefined) {
          return value.milliseconds;
        }
        return JSON.stringify(value);
      }
      return String(value);
    },
    exportToExcel() {
      if (!this.result || this.result.length === 0) return;

      const worksheetData = [
        this.columns,
        ...this.result.map((row) => this.columns.map((col) => this.formatValue(row[col]))),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      const columnWidths = {};
      this.columns.forEach((col, index) => {
        if (col.toLowerCase() === "query") {
          columnWidths[index] = { wch: 80 };
        } else {
          columnWidths[index] = { wch: 15 };
        }
      });
      worksheet["!cols"] = Object.values(columnWidths);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

      const fileName = `pg-lock-viewer-${this.selectedQuery}-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #1a1a1a;
  color: #e0e0e0;
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  background: #2d2d2d;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  min-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

h1 {
  margin-bottom: 30px;
  color: #ffffff;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  align-items: center;
}

.query-select {
  flex: 1;
  padding: 10px 15px;
  font-size: 16px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #1a1a1a;
  color: #e0e0e0;
}

.query-select:focus {
  outline: none;
  border-color: #007bff;
}

.execute-btn {
  padding: 10px 30px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.execute-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.execute-btn:disabled {
  background-color: #444;
  cursor: not-allowed;
  color: #888;
}

.result-container {
  margin-top: 20px;
  flex: 1;
}

.error {
  padding: 15px;
  background-color: #4a1f1f;
  color: #ff6b6b;
  border: 1px solid #6b2a2a;
  border-radius: 4px;
  margin-bottom: 20px;
}

.empty {
  padding: 20px;
  text-align: center;
  color: #888;
}

.result-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background-color: #1a1a1a;
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #444;
  color: #ffffff;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #444;
  color: #e0e0e0;
}

.query-column {
  width: 40%;
  min-width: 400px;
}

.export-container {
  margin-top: 20px;
  text-align: center;
}

.export-btn {
  padding: 10px 30px;
  font-size: 16px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-btn:hover {
  background-color: #218838;
}

tbody tr:hover {
  background-color: #3a3a3a;
}

tbody tr:last-child td {
  border-bottom: none;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #444;
  text-align: center;
}

.footer p {
  color: #888;
  font-size: 14px;
}
</style>
