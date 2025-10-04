import { IsNotEmpty, IsString, IsEnum, IsOptional} from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.SALES;
}
