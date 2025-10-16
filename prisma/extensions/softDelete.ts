// abyss_db/prisma/extensions/softDelete.ts
import { Prisma } from "abyssdb/prisma/generated/client";

const SOFT_DELETE_MODELS = [
  "user",
  "furniture",
  "favorite",
  "furnituretype",
  "furniturematerial",
  "image",
] as const;

type SoftDeleteModels = (typeof SOFT_DELETE_MODELS)[number];
const hasSoftDelete = (model?: string): model is SoftDeleteModels =>
  !!model && (SOFT_DELETE_MODELS as readonly string[]).includes(model);

type Options = {
  disableFilter?: boolean;
  deletedField?: string;
  allowHardDeleteCalls?: boolean;
};

type Where = Record<string, unknown>;
type ArgsWithWhere = { where?: Record<string, unknown> };

function ensureArgs<T extends object | undefined>(args: T): T & ArgsWithWhere {
  return (args ?? ({} as object)) as T & ArgsWithWhere;
}

/** Minimal shape we need from a Prisma model delegate */
type DelegateMinimal = {
  update(args: {
    where: Where;
    data: Record<string, unknown>;
  }): Promise<unknown>;
  updateMany(args: {
    where: Where;
    data: Record<string, unknown>;
  }): Promise<Prisma.BatchPayload>;
  delete(args: { where: Where }): Promise<unknown>;
  deleteMany(args: { where: Where }): Promise<Prisma.BatchPayload>;
};

/** Get the current model delegate (typed, no `any`) */
function getDelegate<TThis>(self: TThis): DelegateMinimal {
  const ctxUnknown = Prisma.getExtensionContext(self) as unknown;
  return ctxUnknown as DelegateMinimal;
}

export function getSoftDeleteExtension({
  disableFilter = false,
  deletedField = "deleted_at",
  allowHardDeleteCalls = false,
}: Options = {}) {
  const addWhereNotDeleted = <T extends ArgsWithWhere>(args: T): void => {
    const where = (args.where ??= {} as Record<string, unknown>);
    if (!(deletedField in where)) {
      where[deletedField] = null;
    }
  };

  return Prisma.defineExtension({
    name: "softDeleteExtension",

    model: {
      $allModels: {
        async softDelete<TThis>(this: TThis, where: Where): Promise<unknown> {
          const d = getDelegate(this);
          const data: Record<string, unknown> = { [deletedField]: new Date() };
          return d.update({ where, data });
        },

        async softDeleteMany<TThis>(
          this: TThis,
          where: Where,
        ): Promise<Prisma.BatchPayload> {
          const d = getDelegate(this);
          const data: Record<string, unknown> = { [deletedField]: new Date() };
          return d.updateMany({ where, data });
        },

        async restore<TThis>(this: TThis, where: Where): Promise<unknown> {
          const d = getDelegate(this);
          const data: Record<string, unknown> = { [deletedField]: null };
          return d.update({ where, data });
        },

        async restoreMany<TThis>(
          this: TThis,
          where: Where,
        ): Promise<Prisma.BatchPayload> {
          const d = getDelegate(this);
          const data: Record<string, unknown> = { [deletedField]: null };
          return d.updateMany({ where, data });
        },

        async hardDelete<TThis>(this: TThis, where: Where): Promise<unknown> {
          const d = getDelegate(this);
          return d.delete({ where });
        },

        async hardDeleteMany<TThis>(
          this: TThis,
          where: Where,
        ): Promise<Prisma.BatchPayload> {
          const d = getDelegate(this);
          return d.deleteMany({ where });
        },
      },
    },

    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },

        async count({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },
        async groupBy({ model, args, query }) {
          if (!disableFilter && hasSoftDelete(model))
            addWhereNotDeleted(ensureArgs(args));
          return query(args);
        },

        async delete({ model, args, query }) {
          if (!hasSoftDelete(model) || allowHardDeleteCalls) return query(args);
          throw new Error(
            `[softDelete] Hard delete blocked on model "${model}". Use prisma.${model}.softDelete(where) or enable { allowHardDeleteCalls: true }.`,
          );
        },
        async deleteMany({ model, args, query }) {
          if (!hasSoftDelete(model) || allowHardDeleteCalls) return query(args);
          throw new Error(
            `[softDelete] Hard deleteMany blocked on model "${model}". Use prisma.${model}.softDeleteMany(where) or enable { allowHardDeleteCalls: true }.`,
          );
        },
      },
    },
  });
}
