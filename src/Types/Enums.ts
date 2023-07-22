export namespace IoT.Enums
{
    export enum Contain {
        no = "no",
        yesSameVersion  = "yes same version",
        yesNewerVersion = "yes newer version",
        yesVersionSmaller = "yes version smaller"
    }
    
    export enum Dialog {
        standard = 1,
        exstandard =2,
        webview = 3,
        exwebview = 4,
        none = 0
    }
    
    /**
     * Defines logging severity levels.
     */
    export enum LogLevel {
      /**
       * Logs that contain the most detailed messages.
       */
      Trace=0,
    
      /**
       * Logs that are used for interactive investigation during development.
       */
      Debug=1,
    
      /**
       * Logs that track the general flow of the application.
       */
      Information=2,
    
      /**
       * Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.
       */
      Warning=3,
    
      /**
       * Logs that highlight when the current flow of execution is stopped due to a failure.
       */
      Error=4
    }

    export enum Existences {
        native = "native",
        docker_container = "docker_container",
        virtual_machine = "virtual_machine",
        none = "none"
    }

    export enum AccountAssignment {
        debug  = "debug",
        management = "management",
        none = "none"
    }
}
