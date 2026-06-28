#!/usr/bin/env bash

# Script de automação para gerar um relatório de saúde do cluster Kubernetes.
# Ele lista os pods que não estão em Running ou Completed e imprime o estado do cluster.
# Decidi focar em saúde de pods porque é uma verificação útil para DevOps e atende ao requisito de relatório de texto.

set -euo pipefail

NAMESPACE=${1:-default}
REPORT_FILE="k8s-health-report-${NAMESPACE}-$(date +%Y%m%d%H%M%S).txt"

mkdir -p scripts

echo "Relatório de saúde do cluster Kubernetes" > "$REPORT_FILE"
echo "Namespace: $NAMESPACE" >> "$REPORT_FILE"
echo "Data: $(date --iso-8601=seconds)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "Contexto atual: $(kubectl config current-context)" >> "$REPORT_FILE"
echo "Nodes:" >> "$REPORT_FILE"
kubectl get nodes --no-headers | awk '{print $1" "$2" "$3" "$4" "$5" "$6}' >> "$REPORT_FILE" || true

echo "" >> "$REPORT_FILE"
echo "Pods fora de Running/Completed:" >> "$REPORT_FILE"
kubectl get pods -n "$NAMESPACE" --no-headers | awk '$3 != "Running" && $3 != "Completed" {print $0}' >> "$REPORT_FILE" || true

echo "" >> "$REPORT_FILE"
echo "Eventos recentes de Warning/Error:" >> "$REPORT_FILE"
kubectl get events -n "$NAMESPACE" --field-selector type=Warning --sort-by='.lastTimestamp' -o wide | tail -20 >> "$REPORT_FILE" || true

echo "Relatório gerado em: $REPORT_FILE"
