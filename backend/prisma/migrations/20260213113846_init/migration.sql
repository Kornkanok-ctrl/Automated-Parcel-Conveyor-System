BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Admin] (
    [name] NVARCHAR(1000) NOT NULL,
    [hash] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Admin_pkey] PRIMARY KEY CLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Transport] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [transport_name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Transport_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Transport_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Receiver] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [fullname] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [roomNumber] NVARCHAR(1000) NOT NULL,
    [token_line] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Receiver_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Receiver_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TransportNumber] (
    [id] UNIQUEIDENTIFIER NOT NULL,
    [id_transport] UNIQUEIDENTIFIER NOT NULL,
    [id_receiver] UNIQUEIDENTIFIER NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TransportNumber_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TransportNumber_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TransportNumber_id_transport_idx] ON [dbo].[TransportNumber]([id_transport]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TransportNumber_id_receiver_idx] ON [dbo].[TransportNumber]([id_receiver]);

-- AddForeignKey
ALTER TABLE [dbo].[TransportNumber] ADD CONSTRAINT [TransportNumber_id_transport_fkey] FOREIGN KEY ([id_transport]) REFERENCES [dbo].[Transport]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TransportNumber] ADD CONSTRAINT [TransportNumber_id_receiver_fkey] FOREIGN KEY ([id_receiver]) REFERENCES [dbo].[Receiver]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
