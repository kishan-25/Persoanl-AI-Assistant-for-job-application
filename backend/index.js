require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require('./routes/jobRoutes');
const { exec } = require("child_process");


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.json({
        success:true,
        message: "API is running"
    });
});

//Routes
app.use("/api/v1/auth", authRoutes);
app.use('/api/v1/jobs', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is runnig on PORT : ${PORT}`));

//Database Connection
// Test function
// const testDBWrite = async () => {
//     try {
//       const testJob = new Job({
//         title: "Test Job",
//         company: "Test Company",
//         source: "Manual Test",
//         text: "This is a test job posting"
//       });
      
//       const saved = await testJob.save();
//       console.log("Test job saved successfully:", saved);
//     } catch (err) {
//       console.error("Error saving test job:", err);
//     }
//   };
  
//   // Call after database connection
//   connectDB().then(() => {
//     testDBWrite();
//   });

connectDB();

//   const runScrapers = async () => {
//         console.log("🔄 Running dummy...");
        
//         const scriptsDir = path.join(__dirname, "scripts");
       
//         const dummyPath = path.join(scriptsDir, "dummyScript.py");

//   try {
//             console.log("📊 Starting python script...");
//             await new Promise((resolve, reject) => {
//                 exec(`python "${dummyPath}"`, (error, stdout, stderr) => {
//                     if (error) {
//                         console.error(`❌ dummy Error: ${error.message}`);
//                         reject(error);
//                         return;
//                     }
//                     if (stderr) console.error(`⚠ Website Scraper Stderr: ${stderr}`);
//                     console.log(`✅ dummy Output: ${stdout}`);
//                     resolve();
//                 });
//             });
            
//         } catch (err) {
//             console.error("❌ Error running scrapers:", err);
//         }
//   }

//   runScrapers();


// //scrapper run
// const runScrapers = async () => {
//     console.log("🔄 Running scrapers...");
    
//     const scriptsDir = path.join(__dirname, "scripts");
//     const telegramScraperPath = path.join(scriptsDir, "telegram_scraper.py");
//     const websiteScraperPath = path.join(scriptsDir, "website_scraper.py");

//     // Run Website Scraper first
//     try {
//         console.log("📊 Starting Website Scraper...");
//         await new Promise((resolve, reject) => {
//             exec(`python "${websiteScraperPath}"`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`❌ Website Scraper Error: ${error.message}`);
//                     reject(error);
//                     return;
//                 }
//                 if (stderr) console.error(`⚠ Website Scraper Stderr: ${stderr}`);
//                 console.log(`✅ Website Scraper Output: ${stdout}`);
//                 resolve();
//             });
//         });
        
//         // Then run Telegram Scraper
//         console.log("📱 Starting Telegram Scraper...");
//         await new Promise((resolve, reject) => {
//             exec(`python "${telegramScraperPath}"`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`❌ Telegram Scraper Error: ${error.message}`);
//                     reject(error);
//                     return;
//                 }
//                 if (stderr) console.error(`⚠ Telegram Scraper Stderr: ${stderr}`);
//                 console.log(`✅ Telegram Scraper Output: ${stdout}`);
//                 resolve();
//             });
//         });
        
//         console.log("✅ All scrapers completed successfully!");
//     } catch (err) {
//         console.error("❌ Error running scrapers:", err);
//     }
// };

// const telegramScrapers = async () => {
//     console.log("🔄 Running scrapers...");
    
//     const scriptsDir = path.join(__dirname, "scripts");
//     const telegramScraperPath = path.join(scriptsDir, "telegram_scraper.py");

//     // Run Website Scraper first
//     try {
        
//         // Then run Telegram Scraper
//         console.log("📱 Starting Telegram Scraper...");
//         await new Promise((resolve, reject) => {
//             exec(`python "${telegramScraperPath}"`, (error, stdout, stderr) => {
//                 if (error) {
//                     console.error(`❌ Telegram Scraper Error: ${error.message}`);
//                     reject(error);
//                     return;
//                 }
//                 if (stderr) console.error(`⚠ Telegram Scraper Stderr: ${stderr}`);
//                 console.log(`✅ Telegram Scraper Output: ${stdout}`);
//                 resolve();
//             });
//         });
        
//         console.log("✅ All scrapers completed successfully!");
//     } catch (err) {
//         console.error("❌ Error running scrapers:", err);
//     }
// };

// // Run scrapers immediately on startup
// runScrapers();

// telegramScrapers();

// // Run scrapers every 24 hours (86400000 ms)
// setInterval(runScrapers, 24 * 60 * 60 * 1000);