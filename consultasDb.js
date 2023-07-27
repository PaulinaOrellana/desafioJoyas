const { Pool } = require('pg');
const format = require('pg-format')

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'amapola',
  database: 'joyas',
  allowExitOnIdle: true
});

const obtenerJoyas = async({ per_page = 5, order_by = 'id_ASC', page = 1  }) =>{
  const TABLE = 'inventario';
  const [campo, direccion] = order_by.split('_'); 
  const offset = (page - 1) * per_page
  const query = format ('SELECT * FROM %s ORDER BY %s %s LIMIT %s OFFSET %s', TABLE, campo, direccion, per_page, offset);
  const {rows: joyas} = await pool.query(query);
  const countQuery = 'SELECT count(id) FROM inventario'
  const { rows: [{ count }] } = await pool.query(countQuery);
  return{
    items: joyas,
    count: +count
  }
}

const obtenerJoyasPorFiltros = async ({ precio_max, precio_min, categoria, metal }) => {
  let filtros = [];
  const values = [];

  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };

  if (precio_max) agregarFiltro('precio', '<=', precio_max);
  if (precio_min) agregarFiltro('precio', '>=', precio_min);
  if (categoria) agregarFiltro('categoria', '=', categoria);
  if (metal) agregarFiltro('metal', '=', metal);

  let consulta = "SELECT * FROM inventario";
  if (filtros.length > 0) {
    filtros = filtros.join(" AND ");
    consulta += ` WHERE ${filtros}`;
  }

  const { rows: joyas } = await pool.query(consulta, values);
  return joyas;
};


module.exports = {obtenerJoyas, obtenerJoyasPorFiltros};