using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Services;
using TicTacToe.Api.Models;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScoreboardController : ControllerBase
{
    private readonly GameService _gameService;

    public ScoreboardController(GameService gameService)
    {
        _gameService = gameService;
    }

    // Get scoreboard
    [HttpGet]
    public ActionResult<Scoreboard> GetScoreboard()
    {
        return Ok(_gameService.GetScoreboard());
    }

    // Reset scoreboard
    [HttpPost("reset")]
    public IActionResult ResetScoreboard()
    {
        _gameService.ResetScoreboard();
        return Ok();
    }
}