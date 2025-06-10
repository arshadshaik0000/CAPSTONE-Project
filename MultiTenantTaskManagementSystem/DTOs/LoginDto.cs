using System.ComponentModel.DataAnnotations;

public class LoginDto
{

    [Required]
    public string Password { get; set; }
    [Required]
    public string Email { get; set; }
}
