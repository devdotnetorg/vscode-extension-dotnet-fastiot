using System;
using System.Device.Gpio;
using System.Device.Gpio.Drivers;
using System.Threading;

namespace %{project.dotnet.namespace}
{
    class Program
    {
        static void Main(string[] args)
        {
            /*Blink an LED
            *
            https://docs.microsoft.com/en-us/dotnet/iot/tutorials/blink-led
            *
            */
            Console.WriteLine("Blinking LED.");
            //for Linux
            //Board: Lichee RV.
            //https://devdotnet.org/post/board-lichee-rv-dock-s-portami-hdmi-i-usb-dlay-sipeed-lichee-rv/
            //Pin: PE16.
            //GPIOCHIP = 0, LED_PIN = 144
            const int GPIOCHIP = 0;
            const int LED_PIN = 144;
            GpioController controller;
            var drvGpio = new LibGpiodDriver(GPIOCHIP);
            controller = new GpioController(PinNumberingScheme.Logical, drvGpio);
            controller.OpenPin(LED_PIN, PinMode.Output);
            controller.Write(LED_PIN,PinValue.Low);
            bool ledOn = false;
            const int count=5;
            for(int i=1;i<count;i++)
            {
                Console.WriteLine($"Step: {i} of {count}");
                controller.Write(LED_PIN, ((ledOn) ? PinValue.High : PinValue.Low));
                Console.WriteLine($"LED: {((ledOn) ? "High" : "Low")}");
                Thread.Sleep(100);
                ledOn = !ledOn;
            }
        }
    }
}
