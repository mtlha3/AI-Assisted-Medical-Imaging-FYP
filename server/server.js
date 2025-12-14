const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const blogRoutes = require("./routes/blogRoutes");
const Brain_MRIRoutes = require("./routes/Brain_MRIRoutes");
const Lungs_Xrays = require("./routes/Lungs_Xray_Route");
const BoneFracture = require("./routes/BoneFractureRoute");
const ECG = require("./routes/ECGRoutes");
const path = require('path');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", blogRoutes);
app.use("/api", Brain_MRIRoutes );
app.use("/api", Lungs_Xrays );
app.use("/api", BoneFracture );
app.use("/api", ECG );


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
