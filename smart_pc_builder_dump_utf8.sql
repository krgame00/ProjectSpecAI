-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: smart_pc_builder
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `image_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'จอคอมพิวเตอร์ 144Hz vs 240Hz: ประสบการณ์ต่างกันจริงหรือแค่ตัวเลขทางการตลาด?','ในโลกของเกมมิ่งและงานที่ต้องการความลื่นไหลของภาพ จอภาพที่มีอัตรารีเฟรชสูง (High Refresh Rate) ได้กลายเป็นมาตรฐานใหม่ที่เราคุ้นเคยกันดี โดยเฉพาะจอ 144Hz ที่มอบประสบการณ์ที่เหนือกว่าจอ 60Hz อย่างเห็นได้ชัด<br><br>แต่เมื่อก้าวเข้าสู่สนามแข่งขันที่ดุเดือดขึ้น ตัวเลข 240Hz ก็เริ่มเข้ามามีบทบาท ทำให้เกิดคำถามว่า การอัปเกรดจาก 144Hz ไป 240Hz นั้นคุ้มค่าจริงหรือเป็นเพียงตัวเลขที่นักการตลาดใช้เพื่อดึงดูดใจ? <br><br>ความแตกต่างระหว่าง 144Hz และ 240Hz นั้น <strong>มีอยู่จริง</strong> แต่สำหรับผู้ใช้งานทั่วไปหรือแม้แต่นักเล่นเกมส่วนใหญ่ ความแตกต่างอาจจะไม่ได้ชัดเจนจนถึงขั้นพลิกโลกเท่ากับการเปลี่ยนจาก 60Hz ไป 144Hz จอ 240Hz จะมอบความลื่นไหลที่เหนือกว่าในทุกเฟรม ทำให้ภาพดูคมชัดและตอบสนองได้ทันท่วงทีมากขึ้น ซึ่งเป็นประโยชน์อย่างมากในเกมแข่งขันที่ต้องอาศัยปฏิกิริยาตอบสนองที่รวดเร็ว เช่น เกมแนว FPS หรือ eSports ระดับมืออาชีพที่ทุกมิลลิวินาทีมีความหมาย อย่างไรก็ตาม การจะขับเคลื่อนจอ 240Hz ให้เต็มประสิทธิภาพ คุณจำเป็นต้องมี <strong>การ์ดจอที่ทรงพลังมากพอ</strong> เพื่อให้ได้เฟรมเรตสูงถึง 240 FPS อย่างสม่ำเสมอในเกมที่คุณเล่น นอกจากนี้ ดวงตาของมนุษย์มีความสามารถในการรับรู้ที่แตกต่างกัน บางคนอาจสัมผัสถึงความแตกต่างได้ในทันที ในขณะที่บางคนอาจต้องใช้เวลาปรับตัวหรืออาจไม่รู้สึกถึงความต่างที่ชัดเจนนัก<br><br>สรุปคือ หากคุณเป็นนักเล่นเกมมืออาชีพ หรือต้องการความได้เปรียบสูงสุดในทุกสถานการณ์ และมีงบประมาณสำหรับการ์ดจอและจอภาพระดับสูง จอ 240Hz คือคำตอบที่ไม่ทำให้ผิดหวัง แต่สำหรับผู้ใช้งานทั่วไปหรือนักเล่นเกมที่ไม่ได้จริงจังกับการแข่งขันมากนัก จอ 144Hz ก็ยังคงเป็นตัวเลือกที่ยอดเยี่ยมที่มอบความลื่นไหลได้อย่างน่าประทับใจและคุ้มค่ากว่าในแง่ของราคา','https://image.pollinations.ai/prompt/%E0%B8%88%E0%B8%AD%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B8%9E%E0%B8%B4%E0%B8%A7%E0%B9%80%E0%B8%95%E0%B8%AD%E0%B8%A3%E0%B9%8C%20144Hz%20vs%20240Hz%20%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%99%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%87%E0%B8%AB%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B9%81%E0%B8%84%E0%B9%88%E0%B8%95%E0%B8%B1%E0%B8%A7%E0%B9%80%E0%B8%A5%E0%B8%82%3F%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(2,'CPU Intel vs AMD อัปเดต 2026: ศึกชิงบัลลังก์ประสิทธิภาพ ใครคือแชมป์สำหรับคุณ?','ในปี 2026 สมรภูมิ <strong>CPU</strong> ระหว่าง <strong>Intel</strong> และ <strong>AMD</strong> ยังคงดุเดือดและเข้มข้นกว่าที่เคย ทั้งสองยักษ์ใหญ่ได้ก้าวข้ามขีดจำกัดเดิมๆ ด้วยสถาปัตยกรรมใหม่ล่าสุดที่ผสานพลังของ AI Accelerator เข้ามาเป็นส่วนหนึ่งของซิลิคอนอย่างเต็มตัว ไม่ว่าจะเป็นด้านประสิทธิภาพต่อวัตต์ การประมวลผล Multi-core หรือความสามารถด้านกราฟิกในตัว (iGPU) ทุกวันนี้ผู้บริโภคต่างได้รับประโยชน์จากนวัตกรรมที่ไม่หยุดยั้งนี้ การเลือกใช้ <strong>CPU</strong> จึงไม่ได้เป็นเพียงแค่การเปรียบเทียบตัวเลข แต่เป็นการพิจารณาถึงความต้องการและรูปแบบการใช้งานที่เฉพาะเจาะจงของคุณ <br><br> สำหรับ <strong>Intel</strong> ในปี 2026 อาจจะโดดเด่นในด้าน <strong>ประสิทธิภาพต่อคอร์ (Single-Core Performance)</strong> ที่ยังคงเป็นหัวใจหลักในการเล่นเกมที่ต้องการเฟรมเรตสูง รวมถึงความเสถียรและความเข้ากันได้กับซอฟต์แวร์และแพลตฟอร์มต่างๆ ที่มีมาอย่างยาวนาน สถาปัตยกรรมที่พัฒนาต่อยอดจะเน้นการทำงานร่วมกับ <strong>AI</strong> ในระดับเครื่องลูกข่าย (On-device AI) ได้อย่างมีประสิทธิภาพ เหมาะสำหรับนักเล่นเกมมืออาชีพ ผู้ใช้งานที่ต้องการความเร็วในการประมวลผลงานเฉพาะด้าน และผู้ที่ให้ความสำคัญกับ ecosystem ที่แข็งแกร่งและเชื่อถือได้ <br><br> ในขณะเดียวกัน <strong>AMD</strong> ด้วยสถาปัตยกรรม <strong>Zen</strong> รุ่นใหม่ๆ ที่คาดว่าจะยังคงเป็นผู้นำในด้าน <strong>ประสิทธิภาพ Multi-Core</strong> และ <strong>ประสิทธิภาพต่อวัตต์ (Performance per Watt)</strong> ที่ยอดเยี่ยม ทำให้เป็นตัวเลือกที่น่าสนใจสำหรับ Content Creator, นักตัดต่อวิดีโอ, หรือนักพัฒนาซอฟต์แวร์ที่ต้องใช้พลังการประมวลผลหลายคอร์อย่างหนักหน่วง นอกจากนี้ <strong>iGPU</strong> ของ <strong>AMD</strong> ยังคงรักษาความได้เปรียบในการมอบประสบการณ์การเล่นเกมที่ไม่ต้องพึ่งการ์ดจอแยกในระดับเริ่มต้นถึงปานกลางได้อย่างน่าประทับใจ เหมาะสำหรับผู้ที่ต้องการสร้างสรรค์ผลงาน, ทำงานที่ต้องใช้พลังประมวลผลสูง, หรือผู้ที่มองหาความคุ้มค่าและความยืดหยุ่นในการใช้งาน โดยรวมแล้ว ไม่มี <strong>CPU</strong> ค่ายไหนที่ดีที่สุดสำหรับทุกคน แต่มี <strong>CPU</strong> ที่เหมาะสมที่สุดสำหรับคุณ ขึ้นอยู่กับว่าคุณให้ความสำคัญกับอะไรมากที่สุด','https://image.pollinations.ai/prompt/CPU%20Intel%20vs%20AMD%20%E0%B8%AD%E0%B8%B1%E0%B8%9B%E0%B9%80%E0%B8%94%E0%B8%95%E0%B8%A5%E0%B9%88%E0%B8%B2%E0%B8%AA%E0%B8%B8%E0%B8%94%E0%B8%9B%E0%B8%B5%202026%20%E0%B8%84%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B9%84%E0%B8%AB%E0%B8%99%E0%B8%95%E0%B8%AD%E0%B8%9A%E0%B9%82%E0%B8%88%E0%B8%97%E0%B8%A2%E0%B9%8C%E0%B9%83%E0%B8%84%E0%B8%A3%3F%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(3,'การ์ดจอมือสอง: คุ้มค่าจริงหรือแค่เสี่ยง? คู่มือเช็กสภาพก่อนตัดสินใจซื้อ','ในยุคที่ราคาการ์ดจอใหม่พุ่งสูงขึ้นอย่างต่อเนื่อง การ์ดจอมือสองกลายเป็นทางเลือกที่น่าสนใจสำหรับใครหลายคน โดยเฉพาะผู้ที่ต้องการอัปเกรดประสิทธิภาพคอมพิวเตอร์ด้วยงบประมาณที่จำกัด การ์ดจอมือสองสามารถมอบประสิทธิภาพที่ยอดเยี่ยมในราคาที่เข้าถึงได้ง่ายกว่ามาก ทว่าเหรียญย่อมมีสองด้าน การซื้อการ์ดจอมือสองก็มาพร้อมกับความเสี่ยงที่ไม่ควรมองข้าม หากไม่ตรวจสอบให้ดี อาจได้การ์ดที่สภาพไม่สมบูรณ์ มีปัญหาแฝง หรือมีอายุการใช้งานที่สั้นลง การตัดสินใจซื้อจึงไม่ใช่แค่เรื่องของราคา แต่ต้องพิจารณาอย่างรอบคอบเพื่อให้ได้ของที่คุ้มค่าและใช้งานได้ยาวนาน<br><br>ก่อนจะควักกระเป๋าจ่ายเงิน สิ่งสำคัญที่สุดคือการ <strong>ตรวจสอบสภาพการ์ดจออย่างละเอียด</strong> เริ่มจากภายนอก ควรสังเกตว่ามีรอยบุบ แตก หัก หรือสนิมหรือไม่ โดยเฉพาะบริเวณพอร์ตเชื่อมต่อ PCIe และ Display Output รวมถึงครีบระบายความร้อน ถัดมาคือการตรวจสอบพัดลมระบายความร้อนว่าหมุนได้ปกติ ไม่มีเสียงดังผิดปกติ และไม่มีฝุ่นจับหนาแน่นจนเกินไป หัวใจสำคัญคือการ <strong>ทดสอบประสิทธิภาพ</strong> หากเป็นไปได้ ควรถามผู้ขายเพื่อขอทดสอบการ์ดจอโดยตรงบนเครื่องคอมพิวเตอร์ของคุณหรือเครื่องของผู้ขาย ด้วยโปรแกรม benchmark ยอดนิยม เช่น FurMark หรือ 3DMark เพื่อดูอุณหภูมิ, อัตราเฟรมเรต และเสถียรภาพขณะทำงานหนักเป็นเวลานาน<br><br>นอกจากนี้ การ <strong>ตรวจสอบประวัติการใช้งานและการรับประกัน</strong> ก็เป็นสิ่งที่ไม่ควรมองข้าม สอบถามให้แน่ใจว่าการ์ดจอเคยผ่านการใช้งานหนัก เช่น การขุดเหมือง (cryptocurrency mining) มาหรือไม่ เพราะการ์ดที่ผ่านงานหนักเช่นนั้นมักมีอายุการใช้งานที่ลดลง และสุดท้าย หากผู้ขายมีการรับประกันให้ ก็จะช่วยเพิ่มความมั่นใจในการซื้อได้มาก การลงทุนเวลาในการตรวจสอบเล็กน้อย จะช่วยให้คุณประหยัดเงินในระยะยาวและได้การ์ดจอที่ตอบโจทย์การใช้งานได้อย่างไร้กังวล','https://image.pollinations.ai/prompt/%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%8C%E0%B8%94%E0%B8%88%E0%B8%AD%E0%B8%A1%E0%B8%B7%E0%B8%AD%E0%B8%AA%E0%B8%AD%E0%B8%87%20%E0%B8%99%E0%B9%88%E0%B8%B2%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%84%E0%B8%AB%E0%B8%A1%3F%20%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%E0%B9%80%E0%B8%8A%E0%B9%87%E0%B8%84%E0%B8%AA%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%81%E0%B9%88%E0%B8%AD%E0%B8%99%E0%B8%95%E0%B8%B1%E0%B8%94%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B9%83%E0%B8%88%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(4,'PSU หัวใจคอมพิวเตอร์: เลือกอย่างไรให้กำลังไฟพอดี ปลอดภัยไร้กังวล','การเลือก Power Supply Unit (PSU) ที่เหมาะสมกับสเปคคอมพิวเตอร์ของคุณนั้นเป็นสิ่งสำคัญที่ไม่ควรมองข้าม เพราะ PSU ไม่ได้เป็นเพียงแค่กล่องจ่ายไฟ แต่เป็นหัวใจหลักที่ส่งพลังงานหล่อเลี้ยงทุกชิ้นส่วนในเครื่อง ไม่ว่าจะเป็น CPU, GPU, RAM หรือแม้แต่ฮาร์ดดิสก์ การเลือก PSU ที่มีคุณภาพและกำลังไฟที่เพียงพอจะช่วยให้ระบบทำงานได้อย่างเสถียร ปลอดภัย และยืดอายุการใช้งานของอุปกรณ์อื่นๆ ในระยะยาว การประหยัดงบประมาณกับ PSU อาจนำมาซึ่งปัญหาที่ไม่คาดฝัน เช่น คอมค้าง ดับเอง หรือร้ายแรงที่สุดคือความเสียหายถาวรต่อชิ้นส่วนราคาแพงอื่นๆ<br><br>สิ่งแรกที่ต้องพิจารณาคือ <strong>กำลังไฟ (Wattage)</strong> ที่คอมพิวเตอร์ของคุณต้องการ คุณสามารถคำนวณกำลังไฟโดยรวมจากสเปคของ CPU และ GPU เป็นหลัก ซึ่งเป็นชิ้นส่วนที่กินไฟมากที่สุด ควรเผื่อกำลังไฟเพิ่มอีก 20-30% เพื่อรองรับการอัปเกรดในอนาคตและเพื่อประสิทธิภาพสูงสุด ถัดมาคือ <strong>มาตรฐาน 80 PLUS Certification</strong> ซึ่งบ่งบอกถึงประสิทธิภาพในการแปลงพลังงาน ยิ่งระดับสูงเท่าไร (Bronze, Silver, Gold, Platinum, Titanium) PSU ก็จะยิ่งจ่ายไฟได้เสถียรขึ้น ประหยัดพลังงานขึ้น และสร้างความร้อนน้อยลง นอกจากนี้ควรพิจารณาเรื่อง <strong>รูปแบบสาย (Modular, Semi-Modular, Non-Modular)</strong> เพื่อความสะดวกในการจัดสายและช่วยให้เคสภายในดูสะอาดตา<br><br>เรื่องความปลอดภัยเป็นอีกหนึ่งหัวใจสำคัญ ควรเลือก PSU จาก <strong>แบรนด์ที่มีชื่อเสียงและมีรีวิวที่ดี</strong> เช่น Seasonic, Corsair, EVGA, Cooler Master หรือ Antec เนื่องจากแบรนด์เหล่านี้มักจะมีระบบป้องกันความปลอดภัยที่ครบครัน (เช่น OVP, UVP, OPP, SCP, OTP) ซึ่งจะช่วยปกป้องอุปกรณ์ของคุณจากความผิดปกติทางไฟฟ้าต่างๆ อย่าหลงเชื่อ PSU ราคาถูกที่ไม่มีข้อมูลความปลอดภัยหรือมาตรฐานรับรองที่ชัดเจน การลงทุนกับ PSU ที่ดีถือเป็นการลงทุนเพื่อความมั่นคงและยั่งยืนของระบบคอมพิวเตอร์ทั้งหมดของคุณ','https://image.pollinations.ai/prompt/%E0%B8%A7%E0%B8%B4%E0%B8%98%E0%B8%B5%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%81%20Power%20Supply%20(PSU)%20%E0%B9%83%E0%B8%AB%E0%B9%89%E0%B8%9E%E0%B8%AD%E0%B8%94%E0%B8%B5%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%AA%E0%B9%80%E0%B8%9B%E0%B8%84%E0%B8%84%E0%B8%AD%E0%B8%A1%20%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%9B%E0%B8%A5%E0%B8%AD%E0%B8%94%E0%B8%A0%E0%B8%B1%E0%B8%A2%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(5,'ถอดรหัสราคา: ทำไมคอมแบรนด์เนมถึงแพงกว่าประกอบเอง? ข้อดีข้อเสียที่คุณต้องรู้ก่อนตัดสินใจซื้อ!','ในโลกของคอมพิวเตอร์ การตัดสินใจเลือกระหว่างคอมพิวเตอร์แบรนด์เนมสำเร็จรูป กับคอมพิวเตอร์ประกอบเอง มักเป็นคำถามยอดฮิตที่หลายคนสงสัย โดยเฉพาะเรื่อง <strong>\"ราคา\"</strong> ที่มักพบว่าคอมพิวเตอร์จากแบรนด์ดังมีราคาสูงกว่าการเลือกซื้อชิ้นส่วนมาประกอบเองอย่างเห็นได้ชัด สาเหตุหลักมาจากปัจจัยหลายประการ ไม่ว่าจะเป็นต้นทุนการวิจัยและพัฒนา การตลาด แบรนด์ดิ้ง การรับประกันที่ครอบคลุม ซอฟต์แวร์ลิขสิทธิ์ที่ติดตั้งมาให้ รวมถึงบริการหลังการขายและเครือข่ายศูนย์บริการที่พร้อมรองรับ ซึ่งทั้งหมดนี้ล้วนเป็นมูลค่าเพิ่มที่ผู้บริโภคต้องจ่ายเพิ่มเข้าไป.<br><br>ข้อดีหลักของคอมพิวเตอร์แบรนด์เนมคือ <strong>\"ความสะดวกสบายและความน่าเชื่อถือ\"</strong> คุณได้เครื่องพร้อมใช้งานทันที ไม่ต้องกังวลเรื่องการเลือกชิ้นส่วน การประกอบ หรือความเข้ากันได้ของฮาร์ดแวร์ นอกจากนี้ยังมาพร้อมกับการรับประกันแบบเบ็ดเสร็จ (เช่น รับประกันทั้งเครื่อง) และบริการหลังการขายที่แข็งแกร่ง ทำให้สบายใจเมื่อเกิดปัญหา อย่างไรก็ตาม ข้อเสียคือ <strong>\"ราคา\"</strong> ที่สูงกว่า และ <strong>\"ข้อจำกัดในการอัปเกรด\"</strong> ที่มักจะทำได้ยากกว่า หรือมีตัวเลือกจำกัด รวมถึงบางครั้งอาจมีซอฟต์แวร์ที่ไม่จำเป็น (Bloatware) ติดตั้งมาด้วย.<br><br>ในทางกลับกัน การประกอบคอมพิวเตอร์เองมอบ <strong>\"ความคุ้มค่าและความยืดหยุ่นสูงสุด\"</strong> คุณสามารถเลือกสเปกได้ตรงตามความต้องการและงบประมาณอย่างแท้จริง ได้ฮาร์ดแวร์ที่ดีที่สุดในราคาที่จ่ายไป และสามารถอัปเกรดชิ้นส่วนแต่ละชิ้นได้ง่ายดายในอนาคต แต่ก็ต้องแลกมาด้วย <strong>\"ความรู้ความเข้าใจ\"</strong> ในการเลือกและประกอบชิ้นส่วน รวมถึงการจัดการเรื่องการรับประกันของแต่ละชิ้นส่วนแยกกัน และต้องรับผิดชอบการแก้ปัญหาด้วยตัวเองเมื่อเกิดเหตุขัดข้อง <br><br>ดังนั้น การตัดสินใจขึ้นอยู่กับความต้องการ งบประมาณ และระดับความเชี่ยวชาญส่วนบุคคล หากเน้นความง่าย สบายใจ และบริการหลังการขาย คอมแบรนด์เนมคือคำตอบ แต่ถ้าต้องการประสิทธิภาพสูงสุดต่อราคา ความยืดหยุ่น และพร้อมที่จะเรียนรู้ การประกอบเองคือทางเลือกที่ใช่กว่า.','https://image.pollinations.ai/prompt/%E0%B8%97%E0%B8%B3%E0%B9%84%E0%B8%A1%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B9%81%E0%B8%9A%E0%B8%A3%E0%B8%99%E0%B8%94%E0%B9%8C%E0%B9%80%E0%B8%99%E0%B8%A1%E0%B8%96%E0%B8%B6%E0%B8%87%E0%B9%81%E0%B8%9E%E0%B8%87%E0%B8%81%E0%B8%A7%E0%B9%88%E0%B8%B2%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B8%81%E0%B8%AD%E0%B8%9A%E0%B9%80%E0%B8%AD%E0%B8%87%3F%20%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B8%94%E0%B8%B5%E0%B8%82%E0%B9%89%E0%B8%AD%E0%B9%80%E0%B8%AA%E0%B8%B5%E0%B8%A2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%84%E0%B8%B8%E0%B8%93%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B8%B9%E0%B9%89%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(6,'สตรีมเมอร์งบจำกัดฟังทางนี้! จัดสเปคคอม 30,000 บาท ทั้งเล่นเกมและสตรีมได้สบาย','การเป็นสตรีมเมอร์ในปัจจุบันไม่ใช่เรื่องยากอีกต่อไป แม้จะมีงบประมาณจำกัดที่ 30,000 บาท คุณก็สามารถประกอบคอมพิวเตอร์ที่พร้อมสำหรับการเล่นเกมและสตรีมมิ่งได้อย่างราบรื่น ไม่ว่าจะเป็นเกมยอดนิยมหรือไลฟ์สไตล์ส่วนตัว หัวใจสำคัญคือการเลือกส่วนประกอบที่ให้ความคุ้มค่าสูงสุดในแต่ละด้าน เพื่อให้การสตรีมของคุณไม่สะดุดและผู้ชมได้รับประสบการณ์ที่ดีที่สุด<br><br>สำหรับงบประมาณนี้ เราจะเน้นไปที่ CPU ที่มีจำนวนคอร์เพียงพอสำหรับการประมวลผลทั้งเกมและการเข้ารหัสวิดีโอ (Encoding) พร้อมกับการ์ดจอที่สามารถรันเกมส่วนใหญ่ที่ความละเอียด Full HD ได้อย่างสบาย และยังมาพร้อมกับ Encoder คุณภาพดีสำหรับการสตรีมโดยเฉพาะ และนี่คือคุณสมบัติหลักที่เราแนะนำ:<br><ul><li><strong>CPU:</strong> AMD Ryzen 5 5600 หรือ Intel Core i5-12400F – เลือกได้ตามความชอบ ทั้งสองรุ่นให้ประสิทธิภาพที่ยอดเยี่ยมสำหรับการเล่นเกมและมีจำนวนคอร์/เธรดที่เพียงพอสำหรับการทำงานร่วมกับการสตรีมมิ่งได้อย่างไม่ติดขัด</li><li><strong>GPU:</strong> AMD Radeon RX 6600 XT หรือ NVIDIA GeForce RTX 3050 – RX 6600 XT ให้ประสิทธิภาพการเล่นเกมที่ดีกว่าในงบประมาณใกล้เคียง ส่วน RTX 3050 มีจุดเด่นที่เทคโนโลยี NVENC ซึ่งช่วยในการสตรีมได้ลื่นไหลเป็นพิเศษ (ลองเช็คราคาในช่วงที่จัดซื้อ เพราะราคาอาจแตกต่างกัน)</li><li><strong>RAM:</strong> 16GB DDR4 Bus 3200MHz (8GB x 2) – เป็นมาตรฐานที่จำเป็นสำหรับการเล่นเกมและการสตรีมไปพร้อมกัน เพื่อให้ระบบทำงานได้อย่างมีเสถียรภาพ</li><li><strong>Storage:</strong> 1TB NVMe SSD – ความเร็วในการโหลดเกมและโปรแกรมจะแตกต่างจาก HDD อย่างเห็นได้ชัด การเลือกใช้ NVMe SSD ขนาด 1TB ทำให้คุณมีพื้นที่เพียงพอสำหรับ Windows, เกม และโปรแกรมสตรีมมิ่งต่างๆ</li><li><strong>Motherboard:</strong> ชิปเซ็ต B550 สำหรับ AMD หรือ B660 สำหรับ Intel – เมนบอร์ดรุ่นเริ่มต้นที่รองรับ CPU และมีฟีเจอร์ที่จำเป็นครบครัน</li><li><strong>PSU (Power Supply):</strong> 600W 80 Plus Bronze – จ่ายไฟได้เพียงพอและมีประสิทธิภาพที่มั่นคงสำหรับทุกส่วนประกอบ</li><li><strong>Case:</strong> เคส Mid-Tower ที่มีการไหลเวียนอากาศดี – เลือกดีไซน์ที่ชอบ แต่เน้นช่องระบายอากาศที่ดีเพื่อช่วยลดความร้อนของอุปกรณ์</li></ul><br>ด้วยสเปคประมาณนี้ คุณจะได้คอมพิวเตอร์ที่พร้อมสำหรับเส้นทางสตรีมเมอร์ของคุณ สามารถเล่นเกมยอดนิยมและสตรีมออกอากาศได้อย่างราบรื่นไร้กังวล สิ่งสำคัญคือการปรับตั้งค่า OBS Studio หรือโปรแกรมสตรีมมิ่งอื่นๆ ให้เหมาะสมกับสเปคคอมพิวเตอร์ของคุณ เพียงเท่านี้ งบ 30,000 บาท ก็ไม่ใช่ข้อจำกัดในการเป็นสตรีมเมอร์อีกต่อไป ขอให้สนุกกับการสตรีมครับ!','https://image.pollinations.ai/prompt/%E0%B8%88%E0%B8%B1%E0%B8%94%E0%B8%AA%E0%B9%80%E0%B8%9B%E0%B8%84%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B8%AA%E0%B8%B2%E0%B8%A2%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B8%A1%E0%B9%80%E0%B8%A1%E0%B8%AD%E0%B8%A3%E0%B9%8C%20%E0%B8%87%E0%B8%9A%2030%2C000%20%E0%B8%9A%E0%B8%B2%E0%B8%97%20%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99%E0%B9%84%E0%B8%94%E0%B9%89%E0%B8%AA%E0%B8%95%E0%B8%A3%E0%B8%B5%E0%B8%A1%E0%B8%A5%E0%B8%B7%E0%B9%88%E0%B8%99%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(7,'DDR5 vs DDR4: ถึงเวลาตัดสินใจอัปเกรดหน่วยความจำคอมพิวเตอร์ของคุณแล้วหรือยัง?','ในโลกของคอมพิวเตอร์ที่หมุนไปอย่างรวดเร็ว หนึ่งในส่วนประกอบสำคัญที่มีบทบาทต่อประสิทธิภาพโดยรวมคือหน่วยความจำ หรือ RAM ปัจจุบันเรากำลังอยู่ในช่วงเปลี่ยนผ่านจากมาตรฐาน DDR4 สู่ DDR5 ซึ่งนำมาซึ่งการปรับปรุงครั้งใหญ่ <strong>DDR5 โดดเด่นด้วยความเร็วสัญญาณนาฬิกาที่สูงกว่ามาก แบนด์วิดท์ที่กว้างขึ้น และการใช้พลังงานที่มีประสิทธิภาพมากขึ้น</strong> สถาปัตยกรรมใหม่นี้ช่วยให้การประมวลผลข้อมูลรวดเร็วและราบรื่นกว่าที่เคยเป็นมา โดยเฉพาะอย่างยิ่งในการทำงานที่ต้องการทรัพยากรสูง<br><br>คำถามสำคัญคือ \"ถึงเวลาที่คุณจะต้องอัปเกรดแล้วหรือยัง?\" การเปลี่ยนไปใช้ DDR5 ไม่ได้หมายถึงแค่การเปลี่ยน RAM เท่านั้น แต่ยังต้องพิจารณาถึงความเข้ากันได้กับเมนบอร์ดและ CPU รุ่นใหม่ที่รองรับ DDR5 โดยเฉพาะ โปรเซสเซอร์รุ่นล่าสุดอย่าง Intel Gen 12 (และใหม่กว่า) หรือ AMD AM5 เท่านั้นที่รองรับ DDR5 หากคุณเป็นนักเล่นเกมที่ต้องการเฟรมเรตสูงสุด ผู้สร้างคอนเทนต์ที่เรนเดอร์วิดีโอ 4K หรือ 8K หรือผู้ใช้งานมืออาชีพที่ต้องการประสิทธิภาพสูงสุด DDR5 ย่อมมอบประสบการณ์ที่ดีกว่าอย่างเห็นได้ชัด แต่สำหรับผู้ใช้งานทั่วไปที่เน้นการใช้งานพื้นฐาน เช่น ท่องเว็บ ทำงานเอกสาร หรือเล่นเกมที่ไม่หนักมาก DDR4 ที่มีราคาเข้าถึงง่ายกว่าก็ยังคงเป็นตัวเลือกที่คุ้มค่าและเพียงพอต่อการใช้งาน<br><br>ดังนั้น การตัดสินใจอัปเกรดควรขึ้นอยู่กับงบประมาณ ความต้องการใช้งาน และแผนการอัปเกรดระบบโดยรวมของคุณ หากคุณกำลังประกอบคอมพิวเตอร์เครื่องใหม่ด้วย CPU และเมนบอร์ดรุ่นล่าสุด การเลือก DDR5 ถือเป็นการลงทุนที่คุ้มค่าสำหรับอนาคตและประสิทธิภาพที่เหนือกว่า <strong>แต่ถ้าคุณยังคงใช้แพลตฟอร์ม DDR4 และรู้สึกว่าประสิทธิภาพยังเพียงพอ การรอให้ราคา DDR5 ลดลงและเทคโนโลยีมีการพัฒนาที่สมบูรณ์แบบยิ่งขึ้นก็อาจเป็นทางเลือกที่ฉลาดกว่าในตอนนี้</strong>','https://image.pollinations.ai/prompt/DDR5%20vs%20DDR4%3A%20%E0%B8%96%E0%B8%B6%E0%B8%87%E0%B9%80%E0%B8%A7%E0%B8%A5%E0%B8%B2%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%95%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%AD%E0%B8%B1%E0%B8%9B%E0%B9%80%E0%B8%81%E0%B8%A3%E0%B8%94%E0%B8%AB%E0%B8%A3%E0%B8%B7%E0%B8%AD%E0%B8%A2%E0%B8%B1%E0%B8%87%3F%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(8,'SSD PCIe Gen 5: จำเป็นแค่ไหนสำหรับคอเกมยุคใหม่?','SSD PCIe Gen 5 กำลังเข้ามาปฏิวัติวงการเก็บข้อมูลด้วยความเร็วที่เหนือกว่า Gen 4 อย่างเห็นได้ชัด ตัวเลขความเร็วอ่าน/เขียนที่ทะลุ 10,000 MB/s ทำให้หลายคนอดสงสัยไม่ได้ว่าเทคโนโลยีสุดล้ำนี้จะเข้ามาเปลี่ยนประสบการณ์การเล่นเกมของเราไปตลอดกาลหรือไม่? ด้วยประสิทธิภาพที่ก้าวกระโดด ผู้ผลิตต่างโฆษณาถึงการโหลดเกมที่เร็วขึ้นอย่างไม่น่าเชื่อ และการรองรับเทคโนโลยีอย่าง DirectStorage ที่จะเข้ามาปลดล็อกศักยภาพของ GPU ให้ทำงานร่วมกับ SSD ได้ดียิ่งขึ้น<br><br>อย่างไรก็ตาม ในความเป็นจริงสำหรับนักเล่นเกมส่วนใหญ่แล้ว <strong>SSD PCIe Gen 5 อาจยังไม่ใช่ \"สิ่งจำเป็น\" ในตอนนี้</strong> เกมในปัจจุบันส่วนใหญ่ถูกพัฒนาขึ้นโดยคำนึงถึงประสิทธิภาพของ SSD PCIe Gen 3 หรือ Gen 4 เป็นหลัก และยังไม่สามารถดึงศักยภาพสูงสุดของ Gen 5 มาใช้งานได้อย่างเต็มที่ แม้แต่เทคโนโลยีอย่าง DirectStorage ที่ออกแบบมาเพื่อใช้ประโยชน์จาก SSD ความเร็วสูง ก็ยังอยู่ในช่วงเริ่มต้นและมีเกมที่รองรับเพียงไม่กี่เกม<br><br>ส่วนคอขวดที่แท้จริงของการเล่นเกมส่วนใหญ่ยังคงอยู่ที่การ์ดจอ (GPU) และหน่วยประมวลผลกลาง (CPU) เป็นหลัก การอัปเกรดไปใช้ SSD Gen 5 จึงอาจไม่ได้ให้ความแตกต่างอย่างมีนัยสำคัญในแง่ของเฟรมเรตหรือเวลาโหลดเกมในชีวิตประจำวัน เมื่อเทียบกับการลงทุนในการ์ดจอหรือซีพียูที่ดีกว่า<br><br>สำหรับเกมเมอร์ทั่วไปที่มองหาความคุ้มค่า การเลือกใช้ SSD PCIe Gen 4 คุณภาพสูงก็เพียงพอและให้ประสิทธิภาพที่ยอดเยี่ยมสำหรับการเล่นเกมทุกประเภทแล้ว การลงทุนกับ Gen 5 ในวันนี้จึงเหมาะสำหรับผู้ที่ต้องการ \"ที่สุด\" ของเทคโนโลยี ผู้ที่ทำงานกับไฟล์ขนาดใหญ่มากๆ หรือผู้ที่ต้องการเตรียมพร้อมสำหรับอนาคตอันไกลโพ้นที่เกมอาจจะเริ่มใช้ประโยชน์จากความเร็วระดับนี้อย่างเต็มที่ แต่สำหรับตอนนี้ <strong>การจัดสรรงบประมาณไปกับการ์ดจอหรือซีพียูที่ทรงพลังกว่าอาจเป็นตัวเลือกที่ชาญฉลาดกว่า</strong> เพื่อให้ได้ประสบการณ์การเล่นเกมที่ราบรื่นและสวยงามที่สุดครับ','https://image.pollinations.ai/prompt/SSD%20PCIe%20Gen%205%20%E0%B8%88%E0%B8%B3%E0%B9%80%E0%B8%9B%E0%B9%87%E0%B8%99%E0%B9%81%E0%B8%84%E0%B9%88%E0%B9%84%E0%B8%AB%E0%B8%99%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%A1%3F%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(9,'อนาคต AIO Liquid Cooling: เย็นกว่า เงียบกว่า และฉลาดกว่าที่เคย','ในยุคที่ประสิทธิภาพการประมวลผลเพิ่มขึ้นอย่างก้าวกระโดด ไม่ว่าจะเป็น CPU หรือ GPU ระดับไฮเอนด์ ความร้อนที่เกิดขึ้นก็เป็นสิ่งท้าทายที่นักพัฒนาต้องเผชิญ ระบบระบายความร้อนด้วยของเหลวแบบปิด หรือ AIO (All-in-One) Liquid Cooling ได้เข้ามามีบทบาทสำคัญในการจัดการปัญหานี้ ด้วยประสิทธิภาพที่เหนือกว่าชุดระบายความร้อนด้วยอากาศทั่วไป และความสะดวกในการติดตั้งที่มากกว่าชุดระบายความร้อนแบบ Custom Loop.<br><br>สำหรับอนาคตของ AIO Liquid Cooling นั้น คาดการณ์ได้ว่าจะเห็นนวัตกรรมที่น่าตื่นเต้นยิ่งขึ้น ไม่เพียงแค่การพัฒนาปั๊มและหม้อน้ำให้มีประสิทธิภาพสูงขึ้นและเสียงรบกวนน้อยลงเท่านั้น แต่ยังรวมถึงการผสานรวมเทคโนโลยีอัจฉริยะเข้ากับการทำงาน เช่น <strong>เซ็นเซอร์อัจฉริยะที่สามารถปรับรอบปั๊มและพัดลมได้แบบเรียลไทม์</strong> ตามโหลดการทำงานและอุณหภูมิที่ตรวจจับได้ เพื่อให้ได้สมดุลที่ลงตัวระหว่างประสิทธิภาพและความเงียบ<br><br>นอกจากนี้ เราอาจได้เห็นการนำวัสดุใหม่ๆ ที่มีคุณสมบัติการนำความร้อนที่ดีขึ้นมาใช้ รวมถึงการออกแบบที่เน้นความสวยงามและสามารถปรับแต่งได้มากขึ้น ทั้งในส่วนของไฟ RGB หรือแม้กระทั่งหน้าจอขนาดเล็กบนบล็อกน้ำที่แสดงข้อมูลระบบแบบอินเทอร์แอคทีฟ ซึ่งจะยกระดับประสบการณ์การใช้งานคอมพิวเตอร์ให้เหนือชั้นกว่าเดิม และทำให้ AIO Liquid Cooling เป็นมากกว่าแค่การระบายความร้อน แต่เป็นส่วนหนึ่งของสุนทรียภาพในพีซีประสิทธิภาพสูงอย่างแท้จริง','https://image.pollinations.ai/prompt/%E0%B8%AD%E0%B8%99%E0%B8%B2%E0%B8%84%E0%B8%95%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%9A%E0%B8%A3%E0%B8%B0%E0%B8%9A%E0%B8%B2%E0%B8%A2%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%99%E0%B8%94%E0%B9%89%E0%B8%A7%E0%B8%A2%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B9%80%E0%B8%AB%E0%B8%A5%E0%B8%A7%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9B%E0%B8%B4%E0%B8%94%20(AIO%20Liquid%20Cooling)%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(10,'ล่าขอบฟ้า 4K: เลือกสเปกคอมเล่นเกมสุดล้ำแห่งปี 2026','การก้าวเข้าสู่โลกของเกมระดับ 4K ในปี 2026 นั้นไม่ใช่เรื่องเล่น ๆ แต่เป็นการลงทุนที่คุ้มค่าสำหรับประสบการณ์ที่สมจริงที่สุด หัวใจหลักของการเล่นเกม 4K คือ <strong>การ์ดจอ (GPU)</strong> ที่ต้องทรงพลังอย่างยิ่ง โดยคาดการณ์ว่าในปีนั้น การ์ดจอระดับเรือธงจากทั้ง NVIDIA (อาจจะเป็นซีรีส์ RTX 6000 หรือสูงกว่า) และ AMD (RDNA 5 หรือรุ่นที่เทียบเท่า) จะเป็นตัวเลือกหลักที่สามารถขับเคลื่อนเกม AAA ด้วยเฟรมเรตที่ลื่นไหลบนความละเอียด 4K ได้อย่างสบาย เราควรมองหาการ์ดจอที่มี VRAM อย่างน้อย 16GB ขึ้นไป หรืออาจจะ 24GB+ เพื่อรองรับเทคโนโลยี Ray Tracing ที่ซับซ้อนและ Texture คุณภาพสูงในอนาคต ทำให้ภาพสวยงามและสมจริงไร้ที่ติ<br><br>นอกจาก GPU ที่แข็งแกร่งแล้ว <strong>หน่วยประมวลผลกลาง (CPU)</strong> ก็สำคัญไม่แพ้กัน ควรเลือก CPU ระดับ High-end อย่าง Intel Core i7/i9 (รุ่น Gen ใหม่ ๆ ที่จะออกมาในปี 2026) หรือ AMD Ryzen 7/9 ที่มีคอร์ประมวลผลสูง เพื่อรองรับการประมวลผลเกมที่ซับซ้อนและการทำงานแบบ Multitasking ไปพร้อมกัน สำหรับ <strong>หน่วยความจำ (RAM)</strong> นั้น 32GB DDR5 ถือเป็นมาตรฐานขั้นต่ำที่แนะนำสำหรับการเล่นเกม 4K ในปี 2026 เพื่อประสิทธิภาพสูงสุด และอาจพิจารณา 64GB สำหรับผู้ที่ต้องการความมั่นใจในระยะยาว ส่วน <strong>พื้นที่จัดเก็บข้อมูล (Storage)</strong> นั้น SSD แบบ NVMe PCIe Gen5 หรือแม้แต่ Gen6 ที่คาดว่าจะเริ่มแพร่หลายในปีนั้น จะช่วยให้การโหลดเกมและฉากต่าง ๆ รวดเร็วทันใจ ไร้การรอคอย ควรมีอย่างน้อย 1-2TB สำหรับเกมโปรด และอาจเพิ่มอีกตัวสำหรับไฟล์อื่น ๆ<br><br>เพื่อให้ส่วนประกอบทั้งหมดทำงานได้อย่างเต็มประสิทธิภาพ <strong>พาวเวอร์ซัพพลาย (PSU)</strong> ขนาด 850W-1000W หรือมากกว่านั้นเป็นสิ่งจำเป็นอย่างยิ่ง และระบบ <strong>ระบายความร้อน</strong> ก็ต้องอยู่ในระดับพรีเมียม ไม่ว่าจะเป็นชุดน้ำ AIO ขนาด 360mm ขึ้นไป หรือชุดระบายความร้อนด้วยลมระดับท็อป เพื่อควบคุมอุณหภูมิของ CPU และ GPU ให้เสถียร สุดท้ายนี้ อย่าลืมจอภาพ! <strong>จอ 4K</strong> ที่มีอัตรารีเฟรช 120Hz ขึ้นไป และรองรับเทคโนโลยี Variable Refresh Rate (เช่น G-Sync หรือ FreeSync) คือกุญแจสำคัญที่จะปลดล็อกประสบการณ์การเล่นเกม 4K ที่สมบูรณ์แบบที่สุด การจัดสเปกคอมสำหรับเล่นเกม 4K ในปี 2026 จึงเป็นการผสมผสานระหว่างพลังประมวลผลขั้นสุดยอด เทคโนโลยีล่าสุด และการวางแผนเพื่ออนาคต เพื่อให้คุณได้สัมผัสทุกรายละเอียดของโลกเสมือนจริงได้อย่างไร้ขีดจำกัด','https://image.pollinations.ai/prompt/%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%A5%E0%B8%B7%E0%B8%AD%E0%B8%81%E0%B8%AA%E0%B9%80%E0%B8%9B%E0%B8%84%E0%B8%84%E0%B8%AD%E0%B8%A1%E0%B8%AA%E0%B8%B3%E0%B8%AB%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B9%80%E0%B8%A5%E0%B9%88%E0%B8%99%E0%B9%80%E0%B8%81%E0%B8%A1%E0%B8%A3%E0%B8%B0%E0%B8%94%E0%B8%B1%E0%B8%9A%204K%20%E0%B9%83%E0%B8%99%E0%B8%9B%E0%B8%B5%202026%20high%20quality%20technology%20hardware%20photography?width=800&height=400&nologo=true','2026-06-27 17:00:00'),(11,'///','ฟหกฟหกฟ','https://placehold.co/600x400/1e1e2e/00e5ff?text=Article','2026-07-05 17:00:00');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_th` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'cpu','ซีพียู (CPU)',NULL,'2026-07-05 08:26:51'),(2,'mobo','เมนบอร์ด (Motherboard)',NULL,'2026-07-05 08:26:51'),(3,'ram','แรม (RAM)',NULL,'2026-07-05 08:26:51'),(4,'gpu','การ์ดจอ (VGA)',NULL,'2026-07-05 08:26:51'),(5,'storage','ที่เก็บข้อมูล (Storage)',NULL,'2026-07-05 08:26:51'),(6,'psu','พาวเวอร์ซัพพลาย (PSU)',NULL,'2026-07-05 08:26:51'),(7,'case','เคส (Case)',NULL,'2026-07-05 08:26:51');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int NOT NULL,
  `category_slug` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_address` text COLLATE utf8mb4_unicode_ci,
  `customer_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `assembly_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'none',
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'assembling',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('ORD-1086','Admin Ploy','','','none',4590.00,'assembling','2026-07-08 13:48:13'),('ORD-2087','Admin Ploy','','','none',4590.00,'assembling','2026-07-08 14:15:25'),('ORD-4674','Admin Ploy','','','none',31940.00,'assembling','2026-07-08 13:50:54'),('ORD-5937','kr','','','none',24800.00,'assembling','2026-07-08 15:46:35'),('ORD-6628','kr','','','none',4590.00,'assembling','2026-07-08 15:45:53'),('ORD-6996','Admin Ploy','','','none',48140.00,'assembling','2026-07-08 15:49:51'),('ORD-7319','Admin Ploy','','','none',4590.00,'assembling','2026-07-08 13:48:34'),('ORD-7486','Admin Ploy','','','none',4590.00,'assembling','2026-07-08 13:48:17'),('ORD-7984','Admin Ploy','','','none',4590.00,'assembling','2026-07-08 15:43:11');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `brand` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_quantity` int DEFAULT '10',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `specifications` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11021 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (10971,1,'AMD','RYZEN THREADRIPPER PRO 7995WX',34990.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18','{\"TDP\": \"\", \"Cores\": \"96\", \"Socket\": \"sTR5\", \"Threads\": \"192\", \"Base Clock\": \"2.5GHz\", \"Boost Clock\": \"\"}'),(10972,1,'AMD','RYZEN 5 5600 3.5GHz 6C 12T',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10973,1,'AMD','RYZEN 7 5800XT 3.8GHz 8C 16T',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10974,1,'AMD','RYZEN 7 9800X3D 4.7GHz 8C 16T',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10975,1,'AMD','RYZEN 7 7800X3D 4.2 GHz 8C 16T',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10976,1,'AMD','RYZEN 5 5500',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10977,1,'AMD','RYZEN 7 9850X3D',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10978,1,'INTEL','CORE ULTRA 5 225F',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10979,1,'AMD','RYZEN 5 7500F',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10980,1,'INTEL','CORE ULTRA 5 225',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10981,2,'ASUS','PRIME A620M-K-CSM',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10982,2,'ASUS','PRIME A520M-K',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10983,2,'ASROCK','H610M-H2/M.2-D5',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10984,2,'GIGABYTE','H810M K (REV 1.0)',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10985,2,'ASROCK','A620AM-HVS',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:18',NULL),(10986,2,'GIGABYTE','A520M K V2 (REV.1.1)',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10987,2,'ASUS','PRIME H610M-K',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10988,2,'GIGABYTE','A520M K V2 (REV.1.2)',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10989,2,'GIGABYTE','H610M K (REV.2.0)',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10990,2,'MSI','A520M-A-PRO',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10991,3,'HIKSEMI','ARMOR BLACK',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10992,3,'HIKSEMI','ARMOR BLACK',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10993,3,'ADATA XPG','LANCER BLADE RGB',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10994,3,'HIKSEMI','ARMOR WHITE',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10995,3,'KINGBANK','KJXS SILVER',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10996,3,'KINGSTON','FURY BEAST RGB BLACK KF432C16BB2AK2/16WP',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10997,3,'HIKSEMI','ARMOR BLACK HSC416U32D3',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10998,3,'CORSAIR','VENGEANCE RGB PRO SL WHITE CMH16GX4M2E3200C16W',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(10999,3,'ADATA','AD5S48008G-S',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11000,3,'LEXAR','THOR DUAL LD4BU008G-R3200GDXG',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11001,6,'GIGABYTE','GP-P750BS',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11002,6,'CORSAIR','CX650',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11003,6,'AZZA','PSAZ',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11004,6,'AEROCOOL','AERO 550',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11005,6,'AEROCOOL','UNITED POWER 600W',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11006,6,'MSI','MAG A600DN',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11007,6,'ASUS','TUF GAMING 650B',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11008,6,'MSI','MAG A850GN PCIE5',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11009,6,'MSI','MAG A650BNL',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11010,6,'THERMALTAKE','SMART BX1',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11011,7,'iHAVECPU','IHC 401TG',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11012,7,'GIGABYTE','C102 GLASS ICE',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11013,7,'iHAVECPU','PRISMA ARGB',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11014,7,'ZALMAN','M4 SE',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11015,7,'iHAVECPU','IHC R06 ARGB',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11016,7,'iHAVECPU','IHC R30',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11017,7,'iHAVECPU','IHC 102 WOOD',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11018,7,'OCYPUS x iHAVECPU','GAMMA C52 ARGB',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11019,7,'iHAVECPU','CRYSTAL Z6 MINI',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL),(11020,7,'iHAVECPU','IHC 102 WOOD',0.00,'https://www.ihavecpu.com/assets/images/logo_light.svg',10,'2026-07-08 16:55:19',NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_case`
--

DROP TABLE IF EXISTS `spec_case`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_case` (
  `product_id` int NOT NULL,
  `form_factor_support` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_gpu_length_mm` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_case_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_case`
--

LOCK TABLES `spec_case` WRITE;
/*!40000 ALTER TABLE `spec_case` DISABLE KEYS */;
INSERT INTO `spec_case` VALUES (11011,'ATX',NULL),(11012,'Micro-ATX',NULL),(11013,'ATX',NULL),(11014,'Micro-ATX',NULL),(11015,'Micro-ATX',NULL),(11016,'Micro-ATX, Mini-ITX',NULL),(11017,'Micro-ATX, Mini-ITX',NULL),(11018,'Micro-ATX, Mini-ITX',NULL),(11019,'Micro-ATX, Mini-ITX',NULL),(11020,'Micro-ATX, Mini-ITX',NULL);
/*!40000 ALTER TABLE `spec_case` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_cpu`
--

DROP TABLE IF EXISTS `spec_cpu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_cpu` (
  `product_id` int NOT NULL,
  `socket` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tdp_watt` int NOT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_cpu_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_cpu`
--

LOCK TABLES `spec_cpu` WRITE;
/*!40000 ALTER TABLE `spec_cpu` DISABLE KEYS */;
INSERT INTO `spec_cpu` VALUES (10971,'sTRX5',65),(10972,'AM4',65),(10973,'AM4',65),(10974,'AM5',65),(10975,'AM5',65),(10976,'AM4',65),(10977,'AM5',120),(10978,'LGA 1851',65),(10979,'AM5',65),(10980,'LGA 1851',65);
/*!40000 ALTER TABLE `spec_cpu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_gpu`
--

DROP TABLE IF EXISTS `spec_gpu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_gpu` (
  `product_id` int NOT NULL,
  `tdp_watt` int NOT NULL,
  `length_mm` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_gpu_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_gpu`
--

LOCK TABLES `spec_gpu` WRITE;
/*!40000 ALTER TABLE `spec_gpu` DISABLE KEYS */;
/*!40000 ALTER TABLE `spec_gpu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_motherboard`
--

DROP TABLE IF EXISTS `spec_motherboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_motherboard` (
  `product_id` int NOT NULL,
  `socket` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ram_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_motherboard_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_motherboard`
--

LOCK TABLES `spec_motherboard` WRITE;
/*!40000 ALTER TABLE `spec_motherboard` DISABLE KEYS */;
INSERT INTO `spec_motherboard` VALUES (10981,'AM5','DDR5'),(10982,'AM4','DDR4'),(10983,'1700','DDR5'),(10984,'1851','DDR5'),(10985,'AM5','DDR5'),(10986,'AM4','DDR4'),(10987,'1700','DDR5'),(10988,'AM4','DDR4'),(10989,'1700','DDR4'),(10990,'AM4','DDR4');
/*!40000 ALTER TABLE `spec_motherboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_psu`
--

DROP TABLE IF EXISTS `spec_psu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_psu` (
  `product_id` int NOT NULL,
  `wattage` int NOT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_psu_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_psu`
--

LOCK TABLES `spec_psu` WRITE;
/*!40000 ALTER TABLE `spec_psu` DISABLE KEYS */;
INSERT INTO `spec_psu` VALUES (11001,750),(11002,650),(11003,550),(11004,550),(11005,600),(11006,600),(11007,650),(11008,850),(11009,650),(11010,650);
/*!40000 ALTER TABLE `spec_psu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_ram`
--

DROP TABLE IF EXISTS `spec_ram`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_ram` (
  `product_id` int NOT NULL,
  `ram_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity_gb` int NOT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_ram_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_ram`
--

LOCK TABLES `spec_ram` WRITE;
/*!40000 ALTER TABLE `spec_ram` DISABLE KEYS */;
INSERT INTO `spec_ram` VALUES (10991,'DDR4',16),(10992,'DDR4',8),(10993,'DDR5',16),(10994,'DDR4',16),(10995,'DDR4',16),(10996,'DDR4',16),(10997,'DDR4',16),(10998,'DDR4',16),(10999,'DDR5',8),(11000,'DDR4',16);
/*!40000 ALTER TABLE `spec_ram` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `spec_storage`
--

DROP TABLE IF EXISTS `spec_storage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spec_storage` (
  `product_id` int NOT NULL,
  PRIMARY KEY (`product_id`),
  CONSTRAINT `spec_storage_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spec_storage`
--

LOCK TABLES `spec_storage` WRITE;
/*!40000 ALTER TABLE `spec_storage` DISABLE KEYS */;
/*!40000 ALTER TABLE `spec_storage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('customer','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Admin Ploy','admin@pc.com','$2b$10$nzka7GuR25fDmPzy2Gdszu8DWXbaHGN7RCaWoSDS7GUZTIH4AU2Te','admin','2026-07-01 14:07:40'),(2,'kr','kk@kk.com','$2b$10$o7qP3mcuW2Oix/LVChovRe9qVNRDhfNChOSY9eyCj6BCRIsl4hQrW','customer','2026-07-01 14:23:25'),(3,'Test User','test99@pc.com','$2b$10$3yhoMt2F9ibMfKH.9pasXOLcvaAQj1gQnxYNXuSNqEDHvJPGwqVI2','customer','2026-07-06 16:48:29'),(4,'Test User','test@pc.com','$2b$10$9Pa4NTMrXBv8ee6GanP8U.1CBQE4d7TdXR861VIaKYHTe.ZKhx/TO','customer','2026-07-06 16:52:28');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-09  1:27:42
