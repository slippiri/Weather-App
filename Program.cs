using Microsoft.AspNetCore.Mvc;
using System.Net;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.CompositeFileProvider(
        new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "html")),
        new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "styles"))
    ),
    RequestPath = ""
});

const string apiKey = "Z3GDS9MGVBJX8RVQFDJCHBNQA";

app.MapGet("/", async (HttpContext context) =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("html/index.html");
});

app.MapGet("/weather", async (
    [FromQuery] string query,
    [FromQuery] string units,
    [FromServices] IHttpClientFactory clientFactory) =>
{
    try
    {
        var client = clientFactory.CreateClient();
        var isGeoQuery = query.Contains(',');

        var baseUrl = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
        var encodedQuery = isGeoQuery ? query : WebUtility.UrlEncode(query);
        var url = $"{baseUrl}{encodedQuery}?unitGroup={units}&key={apiKey}&contentType=json&include=days%2Ccurrent";

        var response = await client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        return Results.Ok(await response.Content.ReadFromJsonAsync<WeatherData>());
    }
    catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
    {
        return Results.NotFound("������� �� �������");
    }
    catch (Exception ex)
    {
        return Results.Problem($"������: {ex.Message}");
    }
});

app.Run();

public class WeatherData
{
    public string Address { get; set; }
    public CurrentConditions CurrentConditions { get; set; }
    public Day[] Days { get; set; }
}

public class CurrentConditions
{
    public double Temp { get; set; }
    public double Humidity { get; set; }
    public double Windspeed { get; set; }
    public string Conditions { get; set; }
}

public class Day
{
    public DateTime Datetime { get; set; }
    public double Temp { get; set; }
    public double Humidity { get; set; }
    public double Windspeed { get; set; }
    public string Conditions { get; set; }
}