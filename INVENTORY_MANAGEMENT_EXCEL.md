# 📊 Gestión de Inventario con Excel + Claude + Jules AI

**Sistema:** Inventario Local (Excel) → Claude (análisis) → Jules (deploy)
**Última actualización:** 11 Marzo 2026
**Estado:** 🟢 Listo para operación

---

## Resumen del Sistema

```
┌──────────────────┐
│ Excel Inventario │ (Spreadsheet local)
│ • Precios        │
│ • Stock          │
│ • Cambios        │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Claude (analyze Excel)           │
│ • Lee cambios                    │
│ • Genera GitHub Issues          │
│ • Formato estructura automática  │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ GitHub Issues (auto-created) │
│ • UPDATE: Product Name       │
│ • ADD: New Product           │
│ • Etiquetadas correctamente  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Jules AI                     │
│ • Lee issue                  │
│ • Crea PR automático         │
│ • Deploy a Cloudflare Pages  │
└──────────────────────────────┘
```

---

## PARTE 1: Crear y Estructurar Excel

### Paso 1: Descargar Template

**Opción A: Usar Google Sheets** (Recomendado - acceso remoto)
1. Ve a https://sheets.google.com
2. Create new → Spreadsheet
3. Nombre: `Pure24_Inventario_2026`
4. Comparte contigo mismo para acceso desde cualquier lado

**Opción B: Excel Local**
1. Abre Excel / LibreOffice Calc
2. Guarda como: `Pure24_Inventario_2026.xlsx`
3. Sube a Dropbox/Drive para backup

### Paso 2: Crear Columnas Base

```
┌─────┬──────────────────┬─────┬────────────┬─────────┬──────────┐
│ SKU │ Nombre Producto  │ Cat │ Precio CLP │ Stock   │ Cambios  │
├─────┼──────────────────┼─────┼────────────┼─────────┼──────────┤
│     │                  │     │            │         │          │
└─────┴──────────────────┴─────┴────────────┴─────────┴──────────┘
```

**Detalles:**
- `SKU` (A): Identificador único (ej: `whey-gs-1`)
- `Nombre Producto` (B): Nombre completo (ej: `Whey Protein Gold Standard`)
- `Categoría` (C): Proteínas, Aminoácidos, Vitaminas, etc.
- `Precio CLP` (D): Número entero sin separadores (ej: `45990`)
- `Stock` (E): Unidades disponibles (ej: `25`)
- `Cambios` (F): Notas sobre qué cambió (ej: "Precio reducido por promo")

### Paso 3: Agregar Columnas de Control (Optional)

```
┌──────────────────┬──────────┬───────────┬────────────┐
│ Fecha Cambio     │ Quién    │ Vigencia  │ Notificado │
├──────────────────┼──────────┼───────────┼────────────┤
│ 2026-03-11       │ Usuario  │ 2026-03-31│ ✅         │
└──────────────────┴──────────┴───────────┴────────────┘
```

**Propósito:**
- Tracking de cambios
- Auditoría
- Validación de vigencia (si es promoción)
- Estado de notificación a través de GitHub

---

## PARTE 2: Workflow Semanal con Claude

### Cada Lunes (Revisión)

1. **Abrir Excel**
   - Dirección: Google Sheets o archivo local
   - Identifica todas las filas que tienen cambios en columna F

2. **Screenshot o Export CSV**
   ```bash
   # Si es Google Sheets:
   # File → Download → CSV

   # Si es Excel:
   # Save as CSV (Excel Format)
   ```

3. **Pega en Claude (este chat)**
   ```
   Tengo una lista de cambios de inventario para procesar.
   Aquí están en formato CSV:

   [pega el contenido del CSV]

   Por favor:
   1. Identifica cada cambio (UPDATE vs ADD)
   2. Genera GitHub Issues estructurados
   3. Dame un script de comandos para crear issues
   ```

4. **Claude genera comandos git/curl**
   ```bash
   # Claude te devolverá algo como:

   # Issue 1: UPDATE Whey Protein
   curl -X POST https://api.github.com/repos/dterr15/pure24-nutrition-ecommerce/issues \
     -H "Authorization: token YOUR_GITHUB_TOKEN" \
     -d '{
       "title": "UPDATE: Whey Protein Gold Standard",
       "body": "Precio: $45990 → $42990",
       "labels": ["maintenance", "product-update"]
     }'
   ```

5. **Ejecuta comandos en terminal**
   ```bash
   # Copia y pega cada curl command
   curl -X POST https://api.github.com/repos/...

   # O usa el Python script (más elegante)
   python3 create_github_issues.py
   ```

6. **Verifica que issues se crearon**
   - Ve a https://github.com/dterr15/pure24-nutrition-ecommerce/issues
   - Deberías ver 3-5 nuevas issues
   - Todas etiquetadas con `maintenance`

---

## PARTE 3: Usar Script Python para Automatizar

Si creas muchos issues regularmente, usa un script Python:

**Archivo: `scripts/create-issues-from-excel.py`**

```python
#!/usr/bin/env python3
"""
Create GitHub Issues from Excel inventory changes.
Requires: pip install openpyxl requests
"""

import csv
import sys
import requests
from datetime import datetime

# Configuration
GITHUB_TOKEN = "ghp_xxxxxxxxxxxx"  # Tu GitHub token
REPO_OWNER = "dterr15"
REPO_NAME = "pure24-nutrition-ecommerce"
GITHUB_API = "https://api.github.com"

def read_excel_csv(csv_file):
    """Lee CSV y retorna lista de cambios"""
    changes = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('Cambios'):  # Solo filas con cambios
                changes.append({
                    'sku': row['SKU'],
                    'nombre': row['Nombre Producto'],
                    'precio': row['Precio CLP'],
                    'stock': row['Stock'],
                    'cambio': row['Cambios']
                })
    return changes

def create_github_issue(title, body, labels):
    """Crea issue en GitHub"""
    url = f"{GITHUB_API}/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "title": title,
        "body": body,
        "labels": labels
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 201:
        issue_url = response.json()['html_url']
        print(f"✅ Issue creado: {issue_url}")
        return True
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return False

def process_changes(csv_file):
    """Procesa cambios y crea issues"""
    changes = read_excel_csv(csv_file)

    if not changes:
        print("⚠️  No hay cambios para procesar")
        return

    print(f"📊 Procesando {len(changes)} cambio(s)...")
    print()

    for change in changes:
        sku = change['sku']
        nombre = change['nombre']
        cambio = change['cambio']

        title = f"UPDATE: {nombre}"
        body = f"""
Producto: **{nombre}** (SKU: `{sku}`)

**Cambios:**
{cambio}

**Precio:** {change['precio']} CLP
**Stock:** {change['stock']} unidades

Fuente: Inventario Excel - {datetime.now().strftime('%Y-%m-%d')}

---
*Issue creado automáticamente por script de inventario*
"""

        labels = ["maintenance", "product-update"]

        print(f"📝 Creando issue: {title}")
        create_github_issue(title, body, labels)
        print()

    print("✅ Proceso completado")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python create-issues-from-excel.py <archivo.csv>")
        sys.exit(1)

    csv_file = sys.argv[1]
    process_changes(csv_file)
```

**Usar el script:**
```bash
# 1. Genera token en https://github.com/settings/tokens
#    Scope: repo

# 2. Guarda token en variable
export GITHUB_TOKEN="ghp_xxxx"

# 3. Exporta Excel como CSV

# 4. Ejecuta script
python3 scripts/create-issues-from-excel.py Pure24_Inventario_2026.csv

# 5. Verifica issues en GitHub
```

---

## PARTE 4: Integración con Claude en Tiempo Real

**Opción: Usar Claude API en el script**

Si quieres que Claude verifique cambios automáticamente:

```python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-xxxx")

def validate_changes_with_claude(changes: list):
    """Usa Claude para validar cambios antes de crear issues"""

    changes_text = "\n".join([
        f"- {c['nombre']}: ${c['precio']} CLP (Stock: {c['stock']})"
        for c in changes
    ])

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": f"""
Eres un gestor de inventario para Pure24 Nutrition.
Revisa estos cambios de productos y:
1. Valida que los precios son razonables (no más de 50% cambio)
2. Valida que SKUs son válidos
3. Sugiere correcciones si algo parece mal

Cambios a validar:
{changes_text}

Formato respuesta:
- ✅ Cambio válido
- ⚠️ Cambio sospechoso (motivo)
"""
            }
        ]
    )

    return message.content[0].text

# Usar:
changes = read_excel_csv('inventario.csv')
validation = validate_changes_with_claude(changes)
print(validation)
```

---

## PARTE 5: Ejemplo Práctico - Paso a Paso

### Escenario: Actualizar 3 productos en Excel

**Lunes 9am:**

1. Abres `Pure24_Inventario_2026.xlsx`:

```
SKU              Nombre                      Precio  Stock  Cambios
whey-gs-1        Whey Gold Standard          42990   25     Promo marzo
creatina-mono    Creatina Monohidrato       24990   50     Precio reducido
bcaa-complex     BCAA Complex (NUEVO)       35990   30     Nuevo producto
```

2. Copias la tabla, la pegas aquí en Claude:

```
Tengo 3 cambios de inventario:

SKU: whey-gs-1
Nombre: Whey Gold Standard
Precio anterior: 45990 → Nuevo: 42990
Stock: 25
Cambio: Promoción de marzo (vigencia hasta 31/03/2026)

SKU: creatina-mono
Nombre: Creatina Monohidrato
Precio anterior: 28990 → Nuevo: 24990
Stock: 50
Cambio: Precio reducido por stock alto

SKU: bcaa-complex (NUEVO)
Nombre: BCAA Complex Premium
Precio: 35990
Stock: 30
Cambio: Nuevo producto llegó a bodega
Descripción: BCAA en relación 2:1:1, óptimo para síntesis proteica
Imagen: [URL o adjunto]

Por favor genera:
1. GitHub Issues estructurados
2. Comandos para crearlos
3. Validación de cambios
```

3. Claude responde:

```markdown
## Validación de Cambios

✅ whey-gs-1: Precio 45990 → 42990 (6.5% reducción, VÁLIDO)
✅ creatina-mono: Precio 28990 → 24990 (13.8% reducción, VÁLIDO)
✅ bcaa-complex: Producto nuevo, precio razonable para categoría

## GitHub Issues a Crear

### Issue 1: UPDATE Whey Gold Standard
```bash
curl -X POST https://api.github.com/repos/dterr15/pure24-nutrition-ecommerce/issues \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "UPDATE: Whey Protein Gold Standard - Promoción Marzo",
    "body": "**Producto:** Whey Protein Gold Standard\n**SKU:** whey-gs-1\n**Precio anterior:** $45,990 CLP\n**Precio nuevo:** $42,990 CLP\n**Vigencia:** hasta 2026-03-31\n\nFuente: Inventario Excel",
    "labels": ["maintenance", "product-update"]
  }'
```

[... más issues ...]

## Próximos Pasos
Ejecuta los 3 comandos curl arriba. Luego:
1. Verifica issues en GitHub
2. Jules AI los verá automáticamente
3. PRs se crearán en 5-15 minutos
4. Aprueba los PRs
5. Deploy automático a Cloudflare
```

4. Copias y pegas los comandos curl en terminal:

```bash
curl -X POST https://api.github.com/repos/dterr15/pure24-nutrition-ecommerce/issues \
  -H "Authorization: token ghp_1234567890" \
  -H "Content-Type: application/json" \
  -d '{...}'

curl -X POST https://api.github.com/repos/dterr15/pure24-nutrition-ecommerce/issues \
  -H "Authorization: token ghp_1234567890" \
  -H "Content-Type: application/json" \
  -d '{...}'

# ... etc
```

5. Esperas 5-15 minutos, y ves que Jules ha creado 3 PRs automáticas

6. Revisas cada PR en GitHub:
   - PR 1: Actualiza whey-gs-1 en products.ts ✅
   - PR 2: Actualiza creatina-mono en products.ts ✅
   - PR 3: Agrega nuevo BCAA product + genera SSG page ✅

7. Apruebas + mergeas los 3 PRs

8. En 5 minutos, GitHub Actions hace deploy a Cloudflare Pages

9. Verificas en producción:
   - https://4bf35764.pure24nutrition.pages.dev/productos/whey-gs-1 → Precio updated ✅
   - https://4bf35764.pure24nutrition.pages.dev/productos/bcaa-complex → Producto nuevo ✅

---

## PARTE 6: Mejores Prácticas

### ✅ HACER

- [ ] Mantener Excel actualizado en tiempo real
- [ ] Crear issues una vez por semana (no diario)
- [ ] Usar columna "Cambios" para documentar por qué
- [ ] Validar cambios con Claude antes de crear issues
- [ ] Revisar PRs de Jules antes de mergear
- [ ] Documentar vigencia de promociones

### ❌ NO HACER

- [ ] Hacer cambios directamente en GitHub (usa Excel)
- [ ] Crear issues manualmente (usa Claude + script)
- [ ] Mergear sin revisar cambios
- [ ] Borrar filas viejas de Excel (guardar histórico)
- [ ] Cambiar múltiples campos a la vez (separa por issue)

---

## PARTE 7: Tabla de Referencia Rápida

| Tarea | Herramienta | Tiempo |
|-------|-----------|--------|
| Actualizar Excel | Google Sheets | 5-10 min |
| Generar Issues | Claude | 5 min |
| Crear Issues en GitHub | curl/Python | 2 min |
| Jules crea PRs | Automático | 5-15 min |
| Revisar PRs | GitHub Web | 5 min/PR |
| Deploy a producción | Automático | 2-3 min |
| **TOTAL por semana** | | **20-40 min** |

---

## Soporte y Troubleshooting

### Problema: Excel se desincroniza con producción

**Solución:**
1. Abre `frontend/src/data/products.ts` en GitHub
2. Compara precios con Excel
3. Identifica diferencia
4. Crea issue UPDATE con el precio correcto
5. Jules arregla

### Problema: GitHub Token expiró

**Solución:**
1. Ve a https://github.com/settings/tokens
2. Crea nuevo token (Personal access token)
3. Scope: `repo`
4. Copia el token
5. Actualiza en tu script/terminal

### Problema: Demasiados cambios simultáneos

**Solución:**
- Máximo 5 issues por lote
- Si tienes más cambios, dividir en 2 lotes separados
- Jules puede procesar 2-3 en paralelo sin problemas

---

**Creado por:** Claude Agent
**Fecha:** 11 Marzo 2026
**Para:** Pure24 Nutrition E-commerce
**Estado:** 🟢 Listo para operación
