using Google.Cloud.Firestore;

namespace backend.Models;

[FirestoreData]
public class Explorador
{
    public string? Id { get; set; }

    [FirestoreProperty]
    public string Nombre { get; set; } = string.Empty;

    [FirestoreProperty]
    public int Edad { get; set; }

    [FirestoreProperty]
    public string Grupo { get; set; } = string.Empty;

    [FirestoreProperty]
    public string Patrulla { get; set; } = string.Empty;
}
