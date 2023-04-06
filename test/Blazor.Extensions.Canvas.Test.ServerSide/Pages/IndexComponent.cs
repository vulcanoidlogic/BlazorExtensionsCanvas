using Blazor.Extensions.Canvas.Canvas2D;
using Microsoft.AspNetCore.Components;
using System;
using System.Threading.Tasks;

namespace Blazor.Extensions.Canvas.Test.ServerSide.Pages
{
    public class IndexComponent : ComponentBase
    {
        private Canvas2DContext _context;

        protected BECanvasComponent _canvasReference;

        protected override async Task OnAfterRenderAsync(bool firstRender)
        {
            this._context = await this._canvasReference.CreateCanvas2DAsync();
            await this._context.SetFillStyleAsync("green");

            await this._context.FillRectAsync(10, 100, 100, 100);

            await this._context.SetFontAsync("48px serif");
            await this._context.StrokeTextAsync("Hello Blazor Extensions Canvas!!!", 0, 60);

            var deleteIconPath = MaterialIcons.DeleteSVGPath;
            await this._context.DrawImageAsync(deleteIconPath, 1f / 24, 0, 0, 1f / 24, 10, 10);

            Console.WriteLine($"deleteIconPath={deleteIconPath}");

        }
    }
}
