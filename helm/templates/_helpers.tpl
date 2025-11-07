{{/*
Expand the name of the chart.
*/}}
{{- define "pg-lock-viewer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "pg-lock-viewer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "pg-lock-viewer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "pg-lock-viewer.labels" -}}
helm.sh/chart: {{ include "pg-lock-viewer.chart" . }}
{{ include "pg-lock-viewer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "pg-lock-viewer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "pg-lock-viewer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend image
*/}}
{{- define "pg-lock-viewer.backend.image" -}}
{{- if .Values.backend.image.repository }}
{{- printf "%s/%s:%s" .Values.imageRegistry .Values.backend.image.repository .Values.backend.image.tag }}
{{- else }}
{{- printf "%s/%s-backend:%s" .Values.imageRegistry (include "pg-lock-viewer.fullname" .) .Values.backend.image.tag }}
{{- end }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "pg-lock-viewer.frontend.image" -}}
{{- if .Values.frontend.image.repository }}
{{- printf "%s/%s:%s" .Values.imageRegistry .Values.frontend.image.repository .Values.frontend.image.tag }}
{{- else }}
{{- printf "%s/%s-frontend:%s" .Values.imageRegistry (include "pg-lock-viewer.fullname" .) .Values.frontend.image.tag }}
{{- end }}
{{- end }}
