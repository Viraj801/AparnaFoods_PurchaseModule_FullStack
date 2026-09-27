# Aparna Foods — Purchase Order Full-Stack Solution

Contains MySQL Database scripts, ASP.NET Core 8 Web API, and React frontend matching the Purchase Module spreadsheet.

## Structure
- `/database/schema.sql`: MySQL DDL for parent table `purchase_orders` and child items `purchase_order_items`.
- `/backend/AparnaFoods.Api/`: ASP.NET Core 8 Web API with Pomelo EF Core MySQL.
- `/frontend/src/App.jsx`: Full-featured React module with forms, live math calculations, and dashboard.

## Quick Start Backend
1. Import `database/schema.sql` into MySQL.
2. In `backend/AparnaFoods.Api/appsettings.json`, set your MySQL root password.
3. Run:
   ```bash
   cd backend/AparnaFoods.Api
   dotnet restore
   dotnet run
   ```
4. Swagger UI will run at `https://localhost:7001/swagger`.

## Quick Start Frontend
1. Copy `frontend/src/App.jsx` into your Vite or Create React App setup (`src/App.jsx`).
2. Install Lucide icons if using custom icons: `npm install lucide-react`.
3. Run `npm run dev` or `npm start`.