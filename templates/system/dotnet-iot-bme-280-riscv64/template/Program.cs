using System;
using Iot.Device.Bmxx80;
using Iot.Device.Bmxx80.FilteringMode;
using System.Device.Gpio;
using System.Device.Gpio.Drivers;
using System.Device.I2c;

namespace %{project.dotnet.namespace}
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("BME280!");
            const int busId = 1;
            //Bme280.DefaultI2cAddress or Bme280.SecondaryI2cAddress
            var i2cSettings = new I2cConnectionSettings(busId, Bme280.SecondaryI2cAddress);
            var i2cDevice = I2cDevice.Create(i2cSettings);
            var bme280 = new Bme280(i2cDevice)
            {
                // set higher sampling
                TemperatureSampling = Sampling.HighResolution,
                PressureSampling = Sampling.UltraHighResolution,
                HumiditySampling = Sampling.UltraHighResolution,
                FilterMode = Bmx280FilteringMode.X2
            };
            //Read data. Perform a synchronous measurement
            var readResult = bme280.Read();
            //                
            Console.WriteLine($"Temperature: {Math.Round((double)readResult.Temperature?.DegreesCelsius, 2, MidpointRounding.AwayFromZero)} \u00B0C");
            Console.WriteLine($"Pressure: {Math.Round((double)(readResult.Pressure?.Hectopascals), 2, MidpointRounding.AwayFromZero)} hPa");
            Console.WriteLine($"          {Math.Round((double)(readResult.Pressure?.MillimetersOfMercury), 2, MidpointRounding.AwayFromZero)} mmHg");                
            Console.WriteLine($"Relative humidity: {Math.Round((double)readResult.Humidity?.Percent, 0, MidpointRounding.AwayFromZero)}%");
            //
            bme280.Dispose();
            i2cDevice.Dispose();
        }
    }
}
