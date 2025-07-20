import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastifyMongo from '@fastify/mongodb';
import { mediaRoutes } from './routes/MediaRoute';
import { favoriteRoute } from './routes/FavoriteRoute';
import { userRoutes } from './routes/UserRoute';

dotenv.config();

const app = Fastify();

app.register(cors);
app.register(fastifyMongo, {
    forceClose: true,
    url: process.env.MONGODB_URI as string,
});

app.register(mediaRoutes);
app.register(favoriteRoute);
app.register(userRoutes);

app.get('/ping', async () => {
    return { pong: true };
});

app.listen({ port: Number(process.env.PORT) || 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server running at ${address}`);
});
