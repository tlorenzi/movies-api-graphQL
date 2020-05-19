const express = require("express");
const graphqlHTTP = require("express-graphql");
const schema = require("./schema/schema");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html');
})

app.use(
    "/api",
    graphqlHTTP({
        schema,
        graphiql: false,
    })
);

app.use(
    "*",
    graphqlHTTP({
        schema,
        graphiql: true,
    })
);

var port = process.env.PORT || 3000;

app.listen(port, console.log("listing on port {port}"));