set NugetUserId=<USER_ID>
set NugetPersonalAccessToken=<OUR_API_KEY>

dotnet pack
nuget.exe restore

nuget.exe push -Source "BlazorExtensionsCanvas" -ApiKey OUR_API_KEY src\Blazor.Extensions.Canvas\bin\Debug\Blazor.Extensions.Canvas.1.1.6.nupkg

#https://dev.to/iamrule/a-guide-on-how-to-test-new-versions-of-your-nuget-packages-locally-1phk

copy src\Blazor.Extensions.Canvas\bin\Debug\Blazor.Extensions.Canvas.1.1.6.nupkg D:\Users\gtful\local.nuget