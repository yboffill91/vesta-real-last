+------------------------------------------------------------+
| ServiceSpotSelector |
|------------------------------------------------------------|
| 1. Obtiene áreas y puestos (useSalesAreas) |
| 2. Mantiene el estado del puesto seleccionado |
| 3. Decide qué mostrar: |
| - Selector de puestos |
| - Detalle de orden (OrderDetail) |
+---------------------+--------------------------------------+
|
v
+-----------------------------------------------+
| AreaSpotList (nuevo) |
|-----------------------------------------------|
| - Recibe áreas y callback de selección |
| - Renderiza lista de áreas y sus spots |
| - Emite evento al seleccionar un spot |
+-----------------------------------------------+
|
v
+-----------------------------------------------+
| (en ServiceSpotSelector) |
|-----------------------------------------------|
| onSpotSelect(spot): |
| - Si spot.status === 'pedido_abierto' |
| -> setSelectedSpot(spot) |
| - Si spot.status === 'libre' |
| -> setSelectedSpot(spot) |
| - Si spot.status === 'cobrado' |
| -> (no acción, solo feedback visual) |
+-----------------------------------------------+
|
v
+-----------------------------------------------+
| OrderDetail |
|-----------------------------------------------|
| - Recibe order_id |
| - Muestra detalle de la orden |
| - Permite acciones sobre la orden |
+-----------------------------------------------+
