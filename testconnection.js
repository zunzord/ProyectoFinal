const { DataSource } = require("typeorm");

const dataSource = new DataSource({
  type: "mysql",
  host: "34.118.152.239",
  port: 3306,
  username: "root",
  password: "22AA22ddffgg.",
  database: "cajafuerte",
  entities: [
     // Especifica el camino a tus entidades
  ],
  synchronize: true,
  logging: false
});

dataSource.initialize()
  .then(() => {
    console.log("Conexión a la base de datos establecida exitosamente.");
    // Puedes cerrar la conexión después de tus pruebas
    dataSource.destroy();
  })
  .catch(error => {
    console.error("Error al conectarse a la base de datos:", error);
  });