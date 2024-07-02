export interface IPyWebview { 
    pywebview: { 
        api: IExternalAPI & { 
            readBinary(fileName: string): Promise<string>
            writeBinary(fileName: string, textFile: string): Promise<void>
            OpenConfigWindow(): Promise<void>
        }
    }
}

