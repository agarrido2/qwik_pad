#!/usr/bin/env bash
# Script de Limpieza - Elimina endpoints innecesarios de /api/demo

echo "🗑️  Eliminando endpoints innecesarios..."

# Eliminar request y verify (innecesarios - duplican routeActions)
rm -rf src/routes/api/demo/request
rm -rf src/routes/api/demo/verify

echo "✅ Eliminados:"
echo "   - src/routes/api/demo/request/ (duplicaba useDemoRequestAction)"
echo "   - src/routes/api/demo/verify/ (duplicaba useVerifyCodeAction)"
echo ""
echo "✅ Mantenido:"
echo "   - src/routes/api/demo/webhook/ (necesario para Retell callback)"
echo ""
echo "✨ Limpieza completada"
