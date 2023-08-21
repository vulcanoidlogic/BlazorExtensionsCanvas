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

            await this._context.SetFillStyleAsync("orange");

            await this._context.FillRectAsync(10, 100, 100, 100);

            await this._context.SetFillStyleAsync("purple");
            await this._context.RoundRectAsync(280, 100, 100, 100, 10);
            await this._context.FillAsync();

            await this._context.SetFillStyleAsync("blue");
            await this._context.CustomRoundedRectAsync(400, 100, 100, 100, 10);
            await this._context.FillAsync();

            await this._context.SetFillStyleAsync("green");

            await this._context.SetFontAsync("48px serif");
            await this._context.StrokeTextAsync("Hello Blazor Extensions Canvas!!!", 0, 60);

            await this._context.SetFillStyleAsync("orange");
            await this._context.DrawImagePathAsync(MaterialIcons.DeleteSVGPath, 1f / 24, 0, 0, 1f / 24, 120, 100);

            await this._context.SetTransformAsync(1f / 24, 0, 0, 1f / 24, 140, 160);
            await this._context.DrawImagePathAsync(MaterialIcons.ArrowDownwardSVGPath);

            await this._context.SetTransformAsync(1, 0, 0, 1, 0, 0);
            // await this._context.DrawImageBase64Async(MaterialIcons.DeleteLarge, 200, 100, 48, 48);

        }
    }
}
