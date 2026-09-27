using Microsoft.EntityFrameworkCore;
using AparnaFoods.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add MySQL connection with Pomelo EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Allow CORS for React development clients
builder.Services.AddCors(options =>
{
    // In development allow the common dev origins and also 127.0.0.1
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:7301",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:7301",
                "https://localhost:3000",
                "https://127.0.0.1:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });

    // Also register a permissive policy for development convenience
    options.AddPolicy("AllowAnyDev", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use a permissive CORS policy in Development to avoid origin issues when using localhost vs 127.0.0.1
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAnyDev");
}
else
{
    app.UseCors("AllowReactApp");
}
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();