using System;
using System.Runtime.InteropServices;

namespace dotnet_console_coreclr_cross_riscv64_v1
{
    class Program
    {
        static void Main(string[] args)
        {
            //Runtime Info
            Console.WriteLine(".NET console application!");
            bool isMono = typeof(object).Assembly.GetType("Mono.RuntimeStructs") != null;
            //output
            Console.WriteLine($"Hello World {(isMono ? "from Mono!" : "from CoreCLR!")}");
            Console.WriteLine(typeof(object).Assembly.FullName);
            Console.WriteLine(System.Reflection.Assembly.GetEntryAssembly ());
            Console.WriteLine($".NET version: {RuntimeInformation.FrameworkDescription}");
            Console.WriteLine($"OS architecture: {RuntimeInformation.OSArchitecture}");
            Console.WriteLine($"OS Id: {RuntimeInformation.RuntimeIdentifier}");
            Console.WriteLine("Successfully!");     
        }
    }
}