using Google.Cloud.Firestore;
using Scalar.AspNetCore; 

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 🔥 CONFIGURACIÓN DE FIREBASE
// ==========================================
// 1. Apuntamos al archivo de credenciales de forma segura dentro de Config
string rutaCredenciales = Path.Combine(Directory.GetCurrentDirectory(), "Config", "firebase-config.json");

// Validación para asegurarnos de que el archivo realmente está ahí
if (!File.Exists(rutaCredenciales))
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"\n❌ ERROR CRÍTICO: No se encontró el archivo en: {rutaCredenciales}\n");
    Console.ResetColor();
    return;
}

// 2. Configuramos la variable de entorno y conectamos con tu ID de proyecto (track-9d5ad)
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", rutaCredenciales);
FirestoreDb database = FirestoreDb.Create("track-9d5ad");

// 3. Lo inyectamos como un servicio único (Singleton) para usarlo en todo el proyecto
builder.Services.AddSingleton(database);
// ==========================================

// Agregamos soporte para Controladores
builder.Services.AddControllers();

// Configuración de OpenAPI (Documentación de tu API)
builder.Services.AddOpenApi();

var app = builder.Build();

// Configurar el pipeline de solicitudes HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // ✨ ¡Scalar listo y activo!
}

app.UseHttpsRedirection();

// Mapeamos los controladores automáticos de C#
app.MapControllers();

// Un endpoint de prueba rápido en la raíz para saber que el servidor responde
app.MapGet("/", () => "🚀 ¡API de 14-Track funcionando correctamente y conectada a Firebase!");

app.Run();