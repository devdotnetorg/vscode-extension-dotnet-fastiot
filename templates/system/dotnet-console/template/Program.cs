﻿using System;

namespace %{project.dotnet.namespace}
{
    class Program
    {
        static void Main(string[] args)
        {            
            Console.WriteLine(".NET console application");
			Console.WriteLine("Hello, %{os.userinfo.username}!");
        }
    }
}