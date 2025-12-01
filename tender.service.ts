import { Injectable, BadRequestException } from '@nestjs/common'; // Import necessary decorators and exceptions from NestJS common module
// تفعيل الأنواع الحقيقية لزيادة أمان الكود (Enable real types for increased code safety)
import { TenderDataMapper } from '../mappers/TenderDataMapper';
import { TenderCreateDto } from '../dtos/TenderCreate.dto';
import { Tender } from '../models/Tender.entity';
import { User } from '../models/User.entity';
import { TenderRepository } from './tender.repository';

@Injectable()
export class TenderService {
  // تفعيل حقن التبعيات (Dependency Injection)
  constructor(private readonly tenderRepository: TenderRepository) {}

  /**
   * إنشاء مناقصة جديدة مع التحقق من صحة منطق الأعمال
   * @param dto - كائن نقل البيانات من الطلب
   * @param currentUser - المستخدم الحالي الذي يقوم بالعملية
   */
  public async createTender(dto: TenderCreateDto, currentUser: User): Promise<Tender> {
    
    // ==================================================================
    // 🛡️ الخطوة 1: التحقق من منطق الأعمال (Business Logic Validation)
    // ==================================================================
    // هذا هو التحقق الحاسم لضمان سلامة التواريخ.
    // يتم قبل أي عملية أخرى.
    if (new Date(dto.decryptionDate) <= new Date(dto.submissionDeadline)) {
      // إلقاء خطأ واضح يصف المشكلة بدقة.
      // سيتم إرسال هذا الخطأ كاستجابة HTTP 400 Bad Request إلى العميل.
      throw new BadRequestException('Validation failed: Decryption date must be strictly after the submission deadline.');
    }

    // 🛡️ الخطوة 1.2: التحقق من أن مجموع أوزان معايير التقييم يساوي 100%
    // هذا الشرط أساسي لضمان نزاهة محرك تحليل الامتثال.
    if (dto.evaluationCriteria && dto.evaluationCriteria.length > 0) {
      const totalWeight = dto.evaluationCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);

      // استخدام هامش صغير (epsilon) لتجنب مشاكل الفاصلة العائمة
      if (Math.abs(totalWeight - 100) > 0.001) {
        throw new BadRequestException(`Validation failed: The sum of evaluation criteria weights must be exactly 100%. Current sum is ${totalWeight}%.`);
      }
    }


    // ==================================================================
    // ✅ الخطوة 2: استمرار منطق العمل الطبيعي بعد نجاح التحقق
    // ==================================================================
    
    // استخدام DataMapper لتصفية وتأمين البيانات القادمة من الواجهة الأمامية
    const tenderData = TenderDataMapper.toPersistence(dto);
    
    // تعيين البيانات التي يسيطر عليها الخادم فقط (مثل المالك والحالة الأولية)
    tenderData.ownerId = currentUser.id;
    tenderData.status = 'DRAFT'; // أو 'PUBLISHED' حسب منطق العمل

    // حفظ المناقصة في قاعدة البيانات وإرجاع الكائن الجديد
    const newTender = await this.tenderRepository.save(tenderData);

    return newTender;
  }
}