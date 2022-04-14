using System;
using System.Runtime.InteropServices;

namespace dotnet_iot_fastiot_test
{
    class Program
    {
        static void Main(string[] args)
        {            
            //FastIot Test
            Console.WriteLine("Test .NET console application!");
            var framework=RuntimeInformation.FrameworkDescription;
            var osArch=RuntimeInformation.OSArchitecture;            
            var osDesc= RuntimeInformation.OSDescription;  
            var osIdent=RuntimeInformation.RuntimeIdentifier;
            var userName = Environment.UserName;            
            var enFastiot=Environment.GetEnvironmentVariable("FASTIOT");
            //output
            Console.WriteLine($".NET version: {framework}");
            Console.WriteLine($"OS architecture: {osArch}");
            Console.WriteLine($"OS version: {osDesc}");            
            Console.WriteLine($"OS Id: {osIdent}");
            Console.WriteLine($"RunAs: {userName}");
            Console.WriteLine($"FASTIOT: {enFastiot}");            
            //
            Console.WriteLine("Successfully!");     
        }
    }
}
