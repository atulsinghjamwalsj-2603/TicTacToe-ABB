using Microsoft.AspNetCore.Mvc;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;
using TicTacToe.Api.DTOs;

namespace TicTacToe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GamesController : ControllerBase
{
    private readonly GameService _gameService;

    public GamesController(GameService gameService)
    {
        _gameService = gameService;
    }

    // Create new game
    [HttpPost]
    public ActionResult<GameState> CreateGame(CreateGameRequest request)
    {
        var game = _gameService.CreateGame(request.Mode);
        return Ok(game);
    }

    // Get game state
    [HttpGet("{id}")]
    public ActionResult<GameState> GetGame(Guid id)
    {
        var game = _gameService.GetGame(id);

        if (game == null) return NotFound();

        return Ok(game);
    }

    // Make move
    [HttpPost("{id}/moves")]
    public ActionResult<GameState> MakeMove(Guid id, MakeMoveRequest request)
    {
        var game = _gameService.MakeMove(id, request.Player, request.Position);

        if (game == null) return NotFound();

        return Ok(game);
    }

    // Undo
    [HttpPost("{id}/undo")]
    public ActionResult<GameState> Undo(Guid id)
    {
        var game = _gameService.Undo(id);

        if (game == null) return NotFound();

        return Ok(game);
    }

    // Reset game
    [HttpPost("{id}/reset")]
    public ActionResult<GameState> Reset(Guid id)
    {
        var game = _gameService.ResetGame(id);

        if (game == null) return NotFound();

        return Ok(game);
    }
}