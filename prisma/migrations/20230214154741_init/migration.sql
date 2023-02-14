-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `protocolos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` TEXT NOT NULL,
    `assunto` TEXT NOT NULL,
    `num_inscricao` TEXT NOT NULL,
    `num_processo` TEXT NOT NULL,
    `anos_analise` TEXT NULL,
    `cpf` TEXT NULL,
    `telefone` TEXT NULL,
    `enviar_whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `protocolos` ADD CONSTRAINT `protocolos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
