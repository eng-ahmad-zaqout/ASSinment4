import express from "express";
import fs from "fs/promises";
import path from "path";

import { fileURLToPath } from "url";
const app = express();
const port = 3000;

//هين حولنا ال import.meta.url الي مسار الملف
const __filename = fileURLToPath(import.meta.url);
//هين حولنا مسار الملف الي مسار المجلد
const __dirname = path.dirname(__filename);
app.use(express.json());
const filePath = path.join(__dirname, "users.json");
// نقرا الملف وبيجيني انو نص بنحولو ل اوبجكت
let data = JSON.parse(await fs.readFile(filePath, "utf-8"));
app.get("/user", (req, res) => {
  //هين عرضنا كل البيانات الي في ملف ال جيسون
  return res.status(201).json(data);
});
app.post("/user", async (req, res) => {
  //اخدنا البيانات الي جايه من البدي وخزناها في متغيرات علشان نقدر نصل الها
  const { email, age, name } = req.body;
  //هين عملنا متغير جديد لل ايدي الجديد الي رح ينضاف
  const newId = data[data.length - 1].id + 1;
  //هين عملنا تحقق اذا الايميل موجود قبل ما نضيفه
  // findindex will return the index of the first element in the array that satisfies the provided testing function. Otherwise, it returns -1, indicating that no element passed the test.
  const isemailExists = data.findIndex((item) => item.email === email);

  if (isemailExists !== -1) {
    //هين اذا الايميل موجود رح يطلعلي رسالة خطأ
    //تنساش انو لازم ترجع ال return عشان ما يكمل الكود
    return res.status(400).json({ error: "Email already exists" });
  } else {
    //هين اذا الايميل مش موجود رح ينضاف
    const newUser = { id: newId, name, age, email };
    //هين ضفنا اليوزر في المتغير الي فيه البيانات الي جايه من ملف ال جيسون
    data.push(newUser);
    //هين كتبنا البيانات الجديدة في ملف ال جيسون
    await fs.writeFile(filePath, JSON.stringify(data));
    // الافضل نعمل ريتيرن لما اعمل ريسبونس عشان ما يكمل الكود
    return res.status(201).json({ message: "User created successfully" });
  }
});
//راجع النوت لانو صار مشكلة في الروت  علشان هذا ستاتيك
app.get("/user/getByName", (req, res) => {
  const { name } = req.query;
  // الحين الفايند اندكس اول عنصر يطابق الشرط هياخدو ويمشي طيب مش ممكن يكون في اكثر من واحد نفس الاسم ف انا استخدمت الفلتر علشان اجيبهم الفلتر لو ترو هترجعلي النتيجة بناءا على الشرط بمصفوفه لو فولس هترجع مصفوفه فاضيه
  const isNameExists = data.filter((ele) =>
    ele.name.toLowerCase().includes(name.toLowerCase())// الان هين لو عندي نفس الاسم بس كابيتل فيه ولو سمول رح يجيبلي الاسمين لانو انا حولت الاسم الي جاي من الكويري و الاسم الي في المصفوفه لسمول
  );
  //هين انا  عملت لو الاسم مش موجود هيكون المصفوفه فش فيها اي اشي ان الاندكس صفر

  if (isNameExists.length === 0) {
    return res.status(400).json({ error: "user not found" });
  } else {
    //هين رجعنا اليوزر الي الاسم تبعو موجود في الكويري
    return res.status(200).json(isNameExists);
  }
});
app.get('/user/filter', (req, res) => {
  
  let {minAge} = req.query;
  
  //هين حولنا ال مين ايج الي جاي من الكويري الي رقم لانو رح يكون سترينغ
  minAge = Number(minAge);
  //هين عملنا تحقق اذا المين ايج مش موجود او مش رقم رح يطلعلي رسالة خطأ
 const filterBYage=data.filter((ele) =>ele.age>=minAge )
 if(filterBYage.length===0){
    return res.status(400).json({ error: "No users found with the specified minimum age" });
 }else{
    return res.status(200).json(filterBYage);
 }

});


app.patch("/user/:id", async (req, res) => {
  //هين اخدنا ال ايدي من الباث الي جاي من الرابط
  const { id } = req.params; // الايدي هين عبارة عن سترينغ يعني اذا الايدي تبعك رقم رح يتحول ل سترينغ
  const { name, age, email } = req.body;
  //هين عملنا تحقق اذا الايدي موجود قبل ما نعدل عليه
  //
  const isEmailExists = data.findIndex((item) => item.email === email);
  const isIdExists = data.findIndex((ele) => ele.id == id);
  if (isIdExists == -1) {
    //تنساش انو لازم ترجع ال return عشان ما يكمل الكود
    return res.status(400).json({ error: "id is NOT exists" });
  } else {
    if (isEmailExists !== -1) {
      return res.status(400).json({ error: "Email already exists" });
    }
    //الحين الاندكس معنا فهيك بنقدر نصل لليورز الي  اله الايدي الي معنا
    data[isIdExists] = {
      //id,
      id: Number(id), //هين الايدي رح يضل زي ما هو ولكن الايدي سترينغ  ف هيك صارت مشكلة  ف الافضل يا نخزن الايدي الي من جوا المصفوفه او احولو ل رقم لما اخزنو

      name: name || data[isIdExists].name, //هين اذا الاسم موجود رح ياخد الاسم الجديد واذا مش موجود رح ياخد الاسم القديم الي موجود في متغير الي جواتو البينات الي في ملف ال جيسون,
      age: age || data[isIdExists].age, //هين اذا العمر موجود رح ياخد العمر الجديد واذا مش موجود رح ياخد العمر القديم الي موجود في متغير الي جواتو البينات الي في ملف ال جيسون,
      email: email || data[isIdExists].email, //هين اذا الايميل موجود رح ياخد الايميل الجديد واذا مش موجود رح ياخد الايميل القديم الي موجود في متغير الي جواتو البينات الي في ملف ال جيسون,
    };
    // res.status(200).json({ message: "User updated successfully" }); الافضل نكتب البيانات الجديدة قبل ما نرجع رسالة نجاح
  }
  //هين كتبنا البيانات الجديدة في ملف ال جيسون
  await fs.writeFile(filePath, JSON.stringify(data));
  return res.status(200).json({ message: "User updated successfully" });
});
// هيك احنا خلينا ال ايدي اختياري يعني اذا حدا حاب يرسل ايدي من الباث او من البدي رح ياخد الايدي الي جاي من الباث واذا مش موجود رح ياخد الايدي الي جاي من البدي
app.delete("/user{/:id}", async (req, res) => {
  // راجع النوت
  const id = req.params.id || req.body.id;

  const isIdExists = data.findIndex((ele) => ele.id == id);
  if (isIdExists == -1) {
    return res.status(400).json({ error: "id is NOT exists" });
  } else {
    //(الاندكس الي يبدا يحظف منو , 1 يعني عنصر واحد بس رح يحذف)
    data.splice(isIdExists, 1); //هين حذفنا اليوزر الي الايدي تبعو موجود في الباث او البدي
  }
  await fs.writeFile(filePath, JSON.stringify(data));
  return res.status(200).json({ message: "User deleted successfully" });
});
//هين عملنا روت جديد الي رح يجيبلي اليوزر الي الايدي تبعو موجود في الباث
app.get("/user/:id", (req, res) => {
  const { id } = req.params;
  const isIdExists = data.findIndex((ele) => ele.id == id);
  if (isIdExists == -1) {
    return res.status(400).json({ error: "user not found" });
  } else {
    //هين رجعنا اليوزر الي الايدي تبعو موجود في الباث
    return res.status(200).json(data[isIdExists]);
  }
});

app.listen(port, () => {
  console.log("Hi ahmad");
});
