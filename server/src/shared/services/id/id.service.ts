import { randomUUID } from "crypto";
import { IIdService } from "./id.service.interface.ts";

export class IdService implements IIdService {
  private static instance: IdService | null = null;

  private constructor() {}

  static getInstance(): IdService {
    if (!IdService.instance) {
      IdService.instance = new IdService();
    }
    return IdService.instance;
  }

  generate(): string {
    return randomUUID();
  }
}
