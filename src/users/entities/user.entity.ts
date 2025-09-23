import { Min } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar'})
    @Min(3)
    name: string;

    @Column({type: 'varchar', unique: true })
    email: string;

    @Column({type: 'varchar' })
    password: string;
}

