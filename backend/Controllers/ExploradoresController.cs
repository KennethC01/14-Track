using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Firestore;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")] // Esto hace que la ruta en internet sea: api/exploradores
public class ExploradoresController : ControllerBase
{
    private readonly FirestoreDb _database;

    // Inyectamos la base de datos de Firebase que configuramos en el Program.cs
    public ExploradoresController(FirestoreDb database)
    {
        _database = database;
    }

    // Guardar un nuevo explorador (POST api/exploradores)
    [HttpPost]
    public async Task<IActionResult> CrearExplorador([FromBody] Explorador nuevoExplorador)
    {
        try
        {
            // 1. Apuntamos a la colección "Exploradores" en Firestore
            CollectionReference coleccion = _database.Collection("Exploradores");
            
            // 2. Guardamos los datos de forma asíncrona
            DocumentReference documento = await coleccion.AddAsync(nuevoExplorador);

            // 3. Si todo sale bien, respondemos con el ID único que generó Firebase
            return Ok(new { 
                id = documento.Id, 
                mensaje = $"¡{nuevoExplorador.Nombre} registrado con éxito en Firebase!" 
            });
        }
        catch (System.Exception ex)
        {
            // Si algo falla (ej. problemas de internet), avisamos con un error 500
            return StatusCode(500, $"Error al guardar en la base de datos: {ex.Message}");
        }
    }
}
