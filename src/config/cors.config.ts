import cors from 'cors'

export const configCors = ()=> {
    return cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                process.env.FRONTEND_PORT1 || "http://localhost:3001",
                process.env.FRONTEND_PORT2 || "http://localhost:5173",
                process.env.FRONTEND_DEPLOYED ,
                process.env.FRONTEND_DOMAIN 
            ]
            if(!origin || allowedOrigins.includes(origin)){
                callback(null, true);
            }else{
                callback(new Error("Not allowed by cors"))
            }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Accept",
            "Content-Range",
            "X-Content-Range"
        ],
        credentials: true,
        preflightContinue: false,
        maxAge: 600,
        optionsSuccessStatus: 204
    })
}