set NugetUserId=<USER_ID>
set NugetPersonalAccessToken=<OUR_API_KEY>

dotnet pack
nuget.exe restore

nuget.exe push -Source "BlazorExtensionsCanvas" -ApiKey vciqzkoknrkcrinrkwxxbr62aal5zhad3kzaextnvc7mq7bncsda src\Blazor.Extensions.Canvas\bin\Debug\Blazor.Extensions.Canvas.1.1.2.nupkg

