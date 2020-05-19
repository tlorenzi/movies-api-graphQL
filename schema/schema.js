const graphql = require("graphql");
const MongoClient = require("mongodb").MongoClient;

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt
} = graphql;

const url =
    "mongodb+srv://tyler:bakersfield@cluster0-anav1.mongodb.net/test?retryWrites=true&w=majority";

let castCollection;
let metaCollection;
let ratingsCollection;


MongoClient.connect(url, function (err, client) {
    if (err) {
        console.log("error connecting to db");
        return;
    }
    console.log("Connected successfully to db");
    const dbName = "data";
    let db = client.db(dbName);
    castCollection = db.collection("cast");
    metaCollection = db.collection("meta");
    ratingsCollection = db.collection("ratings");
});

const MovieType = new GraphQLObjectType({
    name: "Movie",
    fields: () => ({
        title: {
            type: GraphQLString,
        },
        budget: {
            type: GraphQLInt
        },
        genres: {
            type: GraphQLString
        },
        overview: {
            type: GraphQLString
        },
        release_date: {
            type: GraphQLString
        },
        revenue: {
            type: GraphQLString
        },
        runtime: {
            type: GraphQLInt
        },
        vote_average: {
            type: GraphQLInt
        },
        vote_count: {
            type: GraphQLInt
        },
        cast: {
            type: new GraphQLList(ActorType),
            resolve(parent, args, context, info) {
                console.log("MOVIE TYPE");
                return castCollection.find({ id: parent.id }).toArray();
            }
        }
    }),
});

const ActorType = new GraphQLObjectType({
    name: "Actor",
    fields: () => ({
        name: {
            type: GraphQLString
        },
        movies: {
            type: new GraphQLList(MovieType),
            resolve(parent, args, context, info) {

                let arr = [];
                for (let i = 0; i < parent.length; i++) {
                    arr.push(metaCollection.findOne({ id: parent[i].id }));
                }
                return arr;
            }
        }
    })
});

const UserRatingsType = new GraphQLObjectType({
    name: "UserRating",
    fields: () => ({
        rating: {
            type: GraphQLFloat,
            resolve(parent) {
                return parent.rating;
            }
        },
        movie: {
            type: MovieType,
            resolve(parent, args) {
                console.log("MOVIE IN UserRatingsType ", parent.movieId);

                return metaCollection.findOne({ id: Number.toString(parent.movieId) });
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        Movie: {
            type: MovieType,
            args: {
                title: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(parent, args) {
                return metaCollection.findOne({ title: args.title });
            }
        },

        Actor: {
            type: ActorType,
            args: {
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(parent, args) {
                return castCollection.find({ name: args.name }).toArray();
            }
        },

        Ratings: {
            type: new GraphQLList(UserRatingsType),
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
            },
            resolve(parent, args) {
                return ratingsCollection.find({ userId: args.id }).toArray();
            }
        }

    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
});