export namespace IoT.Enums
{
    export enum Entity {
        //listed in order of priority of use
        system = "system",
        webapi ="webapi",
        community = "community",
        user  = "user",
        none = "none"
    }

    export enum Contain {
        no = "no",
        yesSameVersion  = "yes same version",
        yesNewerVersion = "yes newer version",
        yesVersionSmaller = "yes version smaller"
    }
    
    export enum Dialog {
        none = 0,
        standard = 1,
        exstandard =2,
        webview = 3,
        exwebview = 4
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

    export enum Existence {
        none = "none",
        native = "native",
        docker_container = "docker_container",
        virtual_machine = "virtual_machine"
    }

    export enum AccountAssignment {
        none = "none",
        debug  = "debug",
        management = "management"
    }

    export enum ChangeCommand {
        none = "none",
        add  = "add",
        remove = "remove",
        update = "update",
        clear = "clear"
    }
}
