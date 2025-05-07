import express, {Express} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';



const app: Express = express();

//Global Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: process.env.FRONT_END || 'http://localhost:3000',
    credentials: true
}));
// app.use(helmet());

app.use(
    helmet({
      contentSecurityPolicy: false, 
      frameguard: { action: 'sameorigin' },
      xssFilter: true,
    })
  );

app.use(morgan('dev'));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
})

app.use('/api', limiter);


// Root route
app.get('/', (req, res)=>{
  res.send("Tailoring Platform Backend")
})




export {app};




