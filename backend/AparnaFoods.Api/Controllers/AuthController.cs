using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AparnaFoods.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;

        public AuthController(IConfiguration config)
        {
            _config = config;
        }

        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            // TODO: replace with real user store/validation
            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { message = "Invalid credentials." });
            }

            // Simple hard-coded check for demonstration
            // username: admin, password: password
            if (!(req.Username == "admin" && req.Password == "password"))
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            var jwtSection = _config.GetSection("Jwt");
            var key = jwtSection.GetValue<string>("Key");
            var issuer = jwtSection.GetValue<string>("Issuer");
            var audience = jwtSection.GetValue<string>("Audience");
            var expireMinutes = jwtSection.GetValue<int>("ExpireMinutes");

            var claims = new[] {
                new Claim(ClaimTypes.Name, req.Username),
                new Claim(ClaimTypes.Role, "User")
            };

            var keyBytes = Encoding.UTF8.GetBytes(key ?? string.Empty);
            var signingKey = new SymmetricSecurityKey(keyBytes);
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes > 0 ? expireMinutes : 60),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = tokenString });
        }
    }
}
