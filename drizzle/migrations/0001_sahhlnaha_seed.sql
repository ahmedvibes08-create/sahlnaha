insert into public.categories (slug,name_ar,name_en,icon,description_ar,description_en,sort_order) values
('maintenance','صيانة','Maintenance','Wrench','إصلاح وصيانة كل حاجة في البيت','Repairs and upkeep for your home',0),
('home','منزل','Home','House','نظافة ونقاشة ونجارة','Cleaning, painting and carpentry',1),
('cars','سيارات','Cars','Car','ميكانيكا وكهرباء سيارات','Mechanics and car electrics',2),
('education','تعليم','Education','GraduationCap','دروس خصوصية ولغات','Tutoring and languages',3),
('programming','برمجة','Programming','Code2','مواقع وتطبيقات','Websites and apps',4),
('design','تصميم','Design','Palette','جرافيك وديكور','Graphics and interiors',5),
('photography','تصوير','Photography','Camera','تصوير مناسبات ومنتجات','Events and product photography',6),
('beauty','تجميل','Beauty','Sparkles','مكياج وشعر','Makeup and hair',7),
('tailoring','خياطة','Tailoring','Scissors','تفصيل وتعديل ملابس','Custom and altered clothing',8),
('moving','نقل','Moving','Truck','نقل عفش وتوصيل','Furniture moving and delivery',9),
('crafts','حرف يدوية','Handcrafts','Hammer','حدادة وتنجيد','Metalwork and upholstery',10),
('personal','خدمات شخصية','Personal','HeartHandshake','رعاية أطفال ومسنين','Child and elderly care',11),
('business','خدمات للشركات','Business','Briefcase','محاسبة وترجمة','Accounting and translation',12),
('other','أخرى','Other','LayoutGrid','خدمات متنوعة','Miscellaneous services',13);

insert into public.professions (category_id,slug,name_ar,name_en)
select c.id, v.slug, v.ar, v.en from (values
('maintenance','electrician','كهربائي','Electrician'),('maintenance','plumber','سباك','Plumber'),('maintenance','ac_tech','فني تكييف','AC Technician'),
('home','cleaner','عامل نظافة','Cleaner'),('home','painter','نقاش','Painter'),('home','carpenter','نجار','Carpenter'),
('cars','mechanic','ميكانيكي','Mechanic'),('cars','car_electric','كهربائي سيارات','Auto Electrician'),
('education','tutor','مدرس خصوصي','Private Tutor'),('education','quran_teacher','محفظ قرآن','Quran Teacher'),('education','english_teacher','مدرس لغة إنجليزية','English Teacher'),
('programming','web_dev','مطور مواقع','Web Developer'),('programming','mobile_dev','مطور تطبيقات','Mobile Developer'),
('design','graphic_designer','مصمم جرافيك','Graphic Designer'),('design','interior_designer','مصمم ديكور','Interior Designer'),
('photography','photographer','مصور فوتوغرافي','Photographer'),('photography','videographer','مصور فيديو','Videographer'),
('beauty','makeup_artist','خبيرة مكياج','Makeup Artist'),('beauty','hairdresser','كوافير','Hairdresser'),
('tailoring','tailor','خياط','Tailor'),
('moving','mover','نقل عفش','Furniture Mover'),('moving','delivery','مندوب توصيل','Courier'),
('crafts','blacksmith','حداد','Blacksmith'),('crafts','upholsterer','منجد','Upholsterer'),
('personal','babysitter','جليسة أطفال','Babysitter'),('personal','elder_care','مرافق مسنين','Elderly Caregiver'),
('business','accountant','محاسب','Accountant'),('business','translator','مترجم','Translator'),
('other','other_service','خدمة أخرى','Other Service')
) as v(cat,slug,ar,en) join public.categories c on c.slug = v.cat;

do $$
declare
  pw text := 'Sahhlnaha@2026';
  people jsonb := '[
   {"k":"ahmed","n":"أحمد محمد","p":"electrician","g":"suez","a":"الأربعين","x":8,"v":true,"b":"كهربائي معتمد بخبرة في تأسيس وصيانة الشقق والمحلات.","be":"Certified electrician experienced in wiring and maintaining homes and shops.","s":[["تأسيس كهرباء شقة","Full apartment wiring",3500,"3 أيام"],["صيانة أعطال كهربائية","Electrical fault repair",250,"ساعة"]]},
   {"k":"mona","n":"منى علي","p":"graphic_designer","g":"cairo","a":"مدينة نصر","x":6,"v":true,"b":"مصممة هوية بصرية وشعارات للشركات الناشئة والمحلات.","be":"Brand identity and logo designer for startups and local shops.","s":[["تصميم لوجو وهوية","Logo & brand identity",2500,"5 أيام"],["تصميم بوستات سوشيال","Social media posts",900,"3 أيام"]]},
   {"k":"omar","n":"عمر حسن","p":"plumber","g":"alexandria","a":"سموحة","x":10,"v":false,"b":"سباك محترف، تركيب وصيانة أدوات صحية وكشف تسريبات.","be":"Professional plumber: fixtures, maintenance and leak detection.","s":[["كشف وإصلاح تسريب","Leak detection & repair",400,"ساعتين"],["تركيب حمام كامل","Full bathroom installation",4000,"4 أيام"]]},
   {"k":"sara","n":"سارة محمود","p":"tutor","g":"ismailia","a":"الشيخ زايد","x":5,"v":true,"b":"مدرسة رياضيات لطلاب الإعدادي والثانوي بأسلوب مبسط.","be":"Math tutor for middle and high school students with a simple approach.","s":[["حصة رياضيات خاصة","Private math lesson",200,"ساعة"],["مراجعة نهائية للثانوية","Final exam revision",1500,"10 حصص"]]},
   {"k":"mahmoud","n":"محمود عادل","p":"mechanic","g":"giza","a":"الدقي","x":12,"v":false,"b":"ميكانيكي سيارات ملاكي، صيانة دورية وإصلاح أعطال.","be":"Car mechanic for regular service and repairs.","s":[["صيانة دورية للعربية","Routine car service",600,"3 ساعات"],["كشف أعطال بالكمبيوتر","Computer diagnostics",300,"ساعة"]]},
   {"k":"youssef","n":"يوسف إبراهيم","p":"web_dev","g":"cairo","a":"المعادي","x":4,"v":true,"b":"مطور مواقع ومتاجر إلكترونية سريعة ومتجاوبة.","be":"Developer of fast, responsive websites and online stores.","s":[["موقع تعريفي للشركة","Company website",6000,"أسبوعين"],["متجر إلكتروني","Online store",12000,"3 أسابيع"]]},
   {"k":"nour","n":"نور الدين سمير","p":"photographer","g":"alexandria","a":"ستانلي","x":7,"v":false,"b":"تصوير مناسبات وخطوبة وتصوير منتجات احترافي.","be":"Event, engagement and professional product photography.","s":[["تصوير خطوبة","Engagement photoshoot",3000,"4 ساعات"],["تصوير منتجات","Product photography",1200,"يوم"]]},
   {"k":"hana","n":"هنا مصطفى","p":"makeup_artist","g":"giza","a":"الشيخ زايد","x":5,"v":false,"b":"خبيرة مكياج للمناسبات والعرايس.","be":"Makeup artist for brides and special occasions.","s":[["مكياج عروسة","Bridal makeup",4500,"3 ساعات"],["مكياج سهرة","Evening makeup",1200,"ساعة ونصف"]]},
   {"k":"karim","n":"كريم فتحي","p":"ac_tech","g":"cairo","a":"مصر الجديدة","x":9,"v":true,"b":"فني تكييف: تركيب وصيانة وشحن فريون لكل الماركات.","be":"AC technician: installation, servicing and gas refill for all brands.","s":[["تنظيف وصيانة تكييف","AC cleaning & service",350,"ساعة"],["تركيب تكييف جديد","New AC installation",900,"3 ساعات"]]},
   {"k":"fatma","n":"فاطمة سعيد","p":"tailor","g":"dakahlia","a":"المنصورة","x":15,"v":false,"b":"تفصيل فساتين وتعديل ملابس بدقة عالية.","be":"Custom dresses and precise clothing alterations.","s":[["تفصيل فستان","Custom dress",1800,"أسبوع"],["تعديل ملابس","Clothing alterations",150,"يومين"]]},
   {"k":"tarek","n":"طارق نبيل","p":"carpenter","g":"sharqia","a":"الزقازيق","x":11,"v":false,"b":"نجار موبيليا وتفصيل مطابخ ودواليب.","be":"Furniture carpenter for kitchens and wardrobes.","s":[["تفصيل دولاب","Custom wardrobe",7000,"10 أيام"],["صيانة موبيليا","Furniture repair",300,"ساعتين"]]},
   {"k":"reem","n":"ريم خالد","p":"english_teacher","g":"suez","a":"السلام","x":3,"v":false,"b":"مدرسة لغة إنجليزية ومحادثة لكل الأعمار.","be":"English and conversation teacher for all ages.","s":[["كورس محادثة","Conversation course",1600,"8 حصص"],["حصة جرامر","Grammar lesson",180,"ساعة"]]}
  ]';
  custs jsonb := '[{"k":"customer","n":"ليلى حسن","g":"cairo","a":"مدينة نصر"},{"k":"mostafa","n":"مصطفى كمال","g":"giza","a":"الهرم"},{"k":"dina","n":"دينا شريف","g":"alexandria","a":"سموحة"},{"k":"hossam","n":"حسام جمال","g":"suez","a":"الأربعين"}]';
  comments text[] := array['شغل ممتاز ومواعيده مظبوطة جداً.','محترم وسعره معقول، أنصح بيه.','خلص الشغل في الوقت المتفق عليه.','تجربة كويسة جداً وهتعامل معاه تاني.','ذوق وأمانة في الشغل.','كان فيه تأخير بسيط بس الشغل نضيف.'];
  ratings int[] := array[5,5,4,5,4,5,3,5];
  p jsonb; s jsonb; uid uuid; i int := 0; j int; d int; cid uuid; rid uuid;
  cust_ids uuid[] := '{}';
  ids jsonb := '{}';
begin
  -- helper to create an account
  for p in select * from jsonb_array_elements(custs || '[{"k":"admin","n":"إدارة سهلناها"}]'::jsonb) loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',(p->>'k')||'@sahhlnaha.com',extensions.crypt(pw,extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name',p->>'n','role','customer','governorate',p->>'g','area',p->>'a','phone','0112345'||lpad((i)::text,4,'0')),now(),now(),'','','','');
    insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',(p->>'k')||'@sahhlnaha.com','email_verified',true),'email',now(),now(),now());
    if p->>'k' = 'admin' then insert into public.user_roles (user_id, role) values (uid, 'admin');
    else cust_ids := cust_ids || uid; end if;
    ids := ids || jsonb_build_object(p->>'k', uid);
    i := i + 1;
  end loop;

  i := 0;
  for p in select * from jsonb_array_elements(people) loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',(p->>'k')||'@sahhlnaha.com',extensions.crypt(pw,extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}',
      jsonb_build_object('full_name',p->>'n','role','provider','governorate',p->>'g','area',p->>'a','phone','0101234'||lpad(i::text,4,'0')),now() - (i||' days')::interval,now(),'','','','');
    insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (gen_random_uuid(),uid,uid::text,jsonb_build_object('sub',uid::text,'email',(p->>'k')||'@sahhlnaha.com','email_verified',true),'email',now(),now(),now());
    update public.profiles set profession_id = (select id from public.professions where slug = p->>'p'),
      experience_years = (p->>'x')::int, is_verified = (p->>'v')::boolean, bio = p->>'b', bio_en = p->>'be',
      is_available = (p->>'k') not in ('fatma','tarek') where id = uid;
    for s in select * from jsonb_array_elements(p->'s') loop
      insert into public.provider_services (provider_id,profession_id,title_ar,title_en,description_ar,description_en,price,duration)
      values (uid,(select id from public.professions where slug = p->>'p'),s->>0,s->>1,(s->>0)||' بجودة عالية وضمان على الشغل.',(s->>1)||' with quality work and a service guarantee.',(s->>2)::numeric,s->>3);
    end loop;
    for d in 0..6 loop
      insert into public.availability (provider_id,day,start_time,end_time,is_available) values (uid,d,'10:00','19:00',d <> 5);
    end loop;
    for j in 0..(1 + i % 3) loop
      cid := cust_ids[1 + ((i + j) % array_length(cust_ids,1))];
      rid := gen_random_uuid();
      insert into public.service_requests (id,customer_id,provider_id,service_id,description,location,requested_date,budget,status,created_at)
      values (rid,cid,uid,(select id from public.provider_services where provider_id = uid order by price limit 1),'محتاج الخدمة في أقرب وقت.','',current_date - (20 + j*5),500,'completed',now() - ((20 + j*5)||' days')::interval);
      insert into public.reviews (customer_id,provider_id,request_id,rating,review,created_at)
      values (cid,uid,rid,ratings[1 + ((i+j) % 8)],comments[1 + ((i+j) % 6)],now() - ((18 + j*5)||' days')::interval);
    end loop;
    ids := ids || jsonb_build_object(p->>'k', uid);
    i := i + 1;
  end loop;

  insert into public.service_requests (customer_id,provider_id,service_id,description,location,requested_date,requested_time,budget,status) values
   ((ids->>'customer')::uuid,(ids->>'karim')::uuid,(select id from public.provider_services where provider_id=(ids->>'karim')::uuid order by price limit 1),'التكييف مش بيبرد كويس ومحتاج صيانة.','مدينة نصر، القاهرة',current_date+2,'14:00',400,'accepted'),
   ((ids->>'customer')::uuid,(ids->>'mona')::uuid,(select id from public.provider_services where provider_id=(ids->>'mona')::uuid order by price desc limit 1),'محتاجة لوجو لمشروع حلويات منزلية.','أونلاين',current_date+5,'12:00',2000,'pending'),
   ((ids->>'hossam')::uuid,(ids->>'ahmed')::uuid,(select id from public.provider_services where provider_id=(ids->>'ahmed')::uuid order by price limit 1),'فيه ماس كهربا في المطبخ.','الأربعين، السويس',current_date+1,'18:00',300,'pending');

  insert into public.messages (sender_id,receiver_id,message,created_at,read_at) values
   ((ids->>'customer')::uuid,(ids->>'karim')::uuid,'أهلاً، ممكن تيجي يوم الخميس الساعة 2؟',now() - interval '3 hours',now()),
   ((ids->>'karim')::uuid,(ids->>'customer')::uuid,'أكيد، هكون عندك في الميعاد إن شاء الله.',now() - interval '2 hours',now()),
   ((ids->>'customer')::uuid,(ids->>'karim')::uuid,'تمام، شكراً جداً.',now() - interval '1 hour',now());

  delete from public.notifications where type = 'new_message' or user_id <> (ids->>'ahmed')::uuid;

  insert into public.favorites (customer_id,provider_id) values ((ids->>'customer')::uuid,(ids->>'mona')::uuid),((ids->>'customer')::uuid,(ids->>'karim')::uuid);
end $$;