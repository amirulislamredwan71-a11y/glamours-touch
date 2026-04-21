export interface District {
  name: string;
  division: string;
  upazilas: string[];
}

export const DISTRICTS: District[] = [
  // Dhaka Division
  { name: 'Dhaka', division: 'Dhaka', upazilas: ['Adabor','Badda','Banani','Baridhara','Bashabo','Cantonment','Dhanmondi','Demra','Gulshan','Hazaribagh','Jatrabari','Kadamtali','Kalabagan','Khilgaon','Khilkhet','Lalbagh','Mirpur','Mohammadpur','Motijheel','Mugda','Old Dhaka','Pallabi','Rayer Bazar','Sabujbagh','Shyampur','Tejgaon','Turag','Uttara','Wari'] },
  { name: 'Gazipur', division: 'Dhaka', upazilas: ['Gazipur Sadar','Kaliakoir','Kapasia','Sreepur','Tongi'] },
  { name: 'Narsingdi', division: 'Dhaka', upazilas: ['Belabo','Monohardi','Narsingdi Sadar','Palash','Raipura','Shibpur'] },
  { name: 'Narayanganj', division: 'Dhaka', upazilas: ['Araihazar','Bandar','Fatullah','Narayanganj Sadar','Rupganj','Sonargaon'] },
  { name: 'Manikganj', division: 'Dhaka', upazilas: ['Daulatpur','Ghior','Harirampur','Manikganj Sadar','Saturia','Shivalaya','Singair'] },
  { name: 'Munshiganj', division: 'Dhaka', upazilas: ['Gazaria','Louhajang','Munshiganj Sadar','Sirajdikhan','Sreenagar','Tongibari'] },
  { name: 'Tangail', division: 'Dhaka', upazilas: ['Basail','Bhuapur','Delduar','Dhanbari','Ghatail','Gopalpur','Kalihati','Madhupur','Mirzapur','Nagarpur','Sakhipur','Tangail Sadar'] },
  { name: 'Kishoreganj', division: 'Dhaka', upazilas: ['Austagram','Bajitpur','Bhairab','Hossainpur','Itna','Karimganj','Katiadi','Kishoreganj Sadar','Kuliarchar','Mithamain','Nikli','Pakundia','Tarail'] },
  { name: 'Faridpur', division: 'Dhaka', upazilas: ['Alfadanga','Bhanga','Boalmari','Charbhadrasan','Faridpur Sadar','Madhukhali','Nagarkanda','Sadarpur','Saltha'] },
  { name: 'Gopalganj', division: 'Dhaka', upazilas: ['Gopalganj Sadar','Kashiani','Kotalipara','Muksudpur','Tungipara'] },
  { name: 'Madaripur', division: 'Dhaka', upazilas: ['Kalkini','Madaripur Sadar','Rajoir','Shibchar'] },
  { name: 'Rajbari', division: 'Dhaka', upazilas: ['Baliakandi','Goalandaghat','Kalukhali','Pangsha','Rajbari Sadar'] },
  { name: 'Shariatpur', division: 'Dhaka', upazilas: ['Bhedarganj','Damudya','Gosairhat','Naria','Shariatpur Sadar','Zanjira'] },

  // Chittagong Division
  { name: 'Chittagong', division: 'Chittagong', upazilas: ['Agrabad','Akbar Shah','Bayazid','Chandgaon','Chawkbazar','Double Mooring','EPZ','Halishahar','Khulshi','Kotwali','Nasirabad','Pahartali','Panchlaish','Patenga','Sadarghat'] },
  { name: "Cox's Bazar", division: 'Chittagong', upazilas: ["Cox's Bazar Sadar",'Chakaria','Kutubdia','Maheshkhali','Pekua','Ramu','Teknaf','Ukhia'] },
  { name: 'Comilla', division: 'Chittagong', upazilas: ['Barura','Brahmanpara','Burichang','Chandina','Chauddagram','Comilla Sadar','Daudkandi','Debidwar','Homna','Laksam','Meghna','Monohorgonj','Muradnagar','Nangalkot','Titas'] },
  { name: 'Noakhali', division: 'Chittagong', upazilas: ['Begumganj','Chatkhil','Companiganj','Hatiya','Kabirhat','Noakhali Sadar','Senbagh','Sonaimuri','Subarnachar'] },
  { name: 'Feni', division: 'Chittagong', upazilas: ['Chhagalnaiya','Daganbhuiyan','Feni Sadar','Parshuram','Sonagazi'] },
  { name: 'Lakshmipur', division: 'Chittagong', upazilas: ['Kamalnagar','Lakshmipur Sadar','Ramganj','Ramgati','Raipur'] },
  { name: 'Chandpur', division: 'Chittagong', upazilas: ['Chandpur Sadar','Faridganj','Haimchar','Haziganj','Kachua','Matlab Dakshin','Matlab Uttar','Shahrasti'] },
  { name: 'Brahmanbaria', division: 'Chittagong', upazilas: ['Akhaura','Ashuganj','Bancharampur','Brahmanbaria Sadar','Bijoynagar','Kasba','Nabinagar','Nasirnagar','Sarail'] },
  { name: 'Rangamati', division: 'Chittagong', upazilas: ['Bagaichhari','Barkal','Belaichhari','Juraichhari','Kaptai','Kawkhali','Langadu','Naniarchar','Rajasthali','Rangamati Sadar'] },
  { name: 'Khagrachhari', division: 'Chittagong', upazilas: ['Dighinala','Guimara','Khagrachhari Sadar','Lakshmichhari','Mahalchhari','Manikchhari','Matiranga','Panchhari','Ramgarh'] },
  { name: 'Bandarban', division: 'Chittagong', upazilas: ['Ali Kadam','Bandarban Sadar','Lama','Naikhongchhari','Rowangchhari','Ruma','Thanchi'] },

  // Rajshahi Division
  { name: 'Rajshahi', division: 'Rajshahi', upazilas: ['Bagha','Bagmara','Charghat','Durgapur','Godagari','Mohanpur','Paba','Puthia','Rajshahi Sadar','Tanore'] },
  { name: 'Chapainawabganj', division: 'Rajshahi', upazilas: ['Bholahat','Chapainawabganj Sadar','Gomastapur','Nachole','Shibganj'] },
  { name: 'Naogaon', division: 'Rajshahi', upazilas: ['Atrai','Badalgachhi','Dhamoirhat','Mahadebpur','Manda','Mohadevpur','Naogaon Sadar','Niamatpur','Patnitala','Porsha','Raninagar','Sapahar'] },
  { name: 'Natore', division: 'Rajshahi', upazilas: ['Bagatipara','Baraigram','Gurudaspur','Lalpur','Natore Sadar','Singra'] },
  { name: 'Pabna', division: 'Rajshahi', upazilas: ['Atgharia','Bera','Bhangura','Chatmohar','Faridpur','Ishwardi','Pabna Sadar','Santhia','Sujanagar'] },
  { name: 'Sirajganj', division: 'Rajshahi', upazilas: ['Belkuchi','Chauhali','Kamarkhand','Kazipur','Raiganj','Shahjadpur','Sirajganj Sadar','Tarash','Ullapara'] },
  { name: 'Bogura', division: 'Rajshahi', upazilas: ['Adamdighi','Bogura Sadar','Dhunat','Dhupchanchia','Gabtali','Kahaloo','Nandigram','Sariakandi','Shajahanpur','Sherpur','Shibganj','Sonatala'] },
  { name: 'Joypurhat', division: 'Rajshahi', upazilas: ['Akkelpur','Joypurhat Sadar','Kalai','Khetlal','Panchbibi'] },

  // Khulna Division
  { name: 'Khulna', division: 'Khulna', upazilas: ['Batiaghata','Dacope','Daulatpur','Dighalia','Dumuria','Harintana','Khan Jahan Ali','Khalishpur','Khulna Sadar','Koyra','Paikgachha','Phultala','Rupsha','Sonadanga','Terokhada'] },
  { name: 'Jessore', division: 'Khulna', upazilas: ['Abhaynagar','Bagerpara','Bagherpara','Chaugachha','Jhikargachha','Jessore Sadar','Keshabpur','Manirampur','Sharsha'] },
  { name: 'Satkhira', division: 'Khulna', upazilas: ['Assasuni','Debhata','Kalaroa','Kaliganj','Satkhira Sadar','Shyamnagar','Tala'] },
  { name: 'Bagerhat', division: 'Khulna', upazilas: ['Bagerhat Sadar','Chitalmari','Fakirhat','Kachua','Mollahat','Mongla','Morrelganj','Rampal','Sharankhola'] },
  { name: 'Narail', division: 'Khulna', upazilas: ['Kalia','Lohagara','Narail Sadar'] },
  { name: 'Magura', division: 'Khulna', upazilas: ['Magura Sadar','Mohammadpur','Shalikha','Sreepur'] },
  { name: 'Jhenaidah', division: 'Khulna', upazilas: ['Harinakunda','Jhenaidah Sadar','Kaliganj','Kotchandpur','Maheshpur','Shailkupa'] },
  { name: 'Kushtia', division: 'Khulna', upazilas: ['Bheramara','Daulatpur','Khoksa','Kumarkhali','Kushtia Sadar','Mirpur'] },
  { name: 'Meherpur', division: 'Khulna', upazilas: ['Gangni','Meherpur Sadar','Mujibnagar'] },
  { name: 'Chuadanga', division: 'Khulna', upazilas: ['Alamdanga','Chuadanga Sadar','Damurhuda','Jibannagar'] },

  // Barisal Division
  { name: 'Barisal', division: 'Barisal', upazilas: ['Agailjhara','Babuganj','Bakerganj','Banaripara','Barisal Sadar','Gaurnadi','Hizla','Mehendiganj','Muladi','Wazirpur'] },
  { name: 'Pirojpur', division: 'Barisal', upazilas: ['Bhandaria','Kawkhali','Mathbaria','Nazirpur','Nesarabad','Pirojpur Sadar','Zianagar'] },
  { name: 'Bhola', division: 'Barisal', upazilas: ['Bhola Sadar','Burhanuddin','Char Fasson','Daulatkhan','Lalmohan','Manpura','Tazumuddin'] },
  { name: 'Patuakhali', division: 'Barisal', upazilas: ['Bauphal','Dashmina','Dumki','Galachipa','Kalapara','Mirzaganj','Patuakhali Sadar','Rangabali'] },
  { name: 'Barguna', division: 'Barisal', upazilas: ['Amtali','Bamna','Barguna Sadar','Betagi','Patharghata','Taltali'] },
  { name: 'Jhalokati', division: 'Barisal', upazilas: ['Jhalokati Sadar','Kathalia','Nalchity','Rajapur'] },

  // Sylhet Division
  { name: 'Sylhet', division: 'Sylhet', upazilas: ['Balaganj','Beanibazar','Bishwanath','Companiganj','Dakshin Surma','Fenchuganj','Golapganj','Gowainghat','Jaintapur','Kanaighat','Osmani Nagar','Sylhet Sadar','Zakiganj'] },
  { name: 'Moulvibazar', division: 'Sylhet', upazilas: ['Barlekha','Juri','Kamalganj','Kulaura','Moulvibazar Sadar','Rajnagar','Sreemangal'] },
  { name: 'Habiganj', division: 'Sylhet', upazilas: ['Ajmiriganj','Baniachong','Bahubal','Chunarughat','Habiganj Sadar','Lakhai','Madhabpur','Nabiganj'] },
  { name: 'Sunamganj', division: 'Sylhet', upazilas: ['Bishwamvarpur','Chhatak','Derai','Dharampasha','Dowarabazar','Jagannathpur','Jamalganj','Sullah','Sunamganj Sadar','Tahirpur'] },

  // Mymensingh Division
  { name: 'Mymensingh', division: 'Mymensingh', upazilas: ['Bhaluka','Dhobaura','Fulbaria','Gaffargaon','Gauripur','Haluaghat','Ishwarganj','Muktagachha','Mymensingh Sadar','Nandail','Phulpur','Trishal'] },
  { name: 'Netrokona', division: 'Mymensingh', upazilas: ['Atpara','Barhatta','Durgapur','Kalmakanda','Kendua','Khaliajuri','Madan','Mohanganj','Netrokona Sadar','Purbadhala'] },
  { name: 'Jamalpur', division: 'Mymensingh', upazilas: ['Bakshiganj','Dewanganj','Islampur','Jamalpur Sadar','Madarganj','Melandaha','Sarishabari'] },
  { name: 'Sherpur', division: 'Mymensingh', upazilas: ['Jhenaigati','Nakla','Nalitabari','Sherpur Sadar','Sreebardi'] },

  // Rangpur Division
  { name: 'Rangpur', division: 'Rangpur', upazilas: ['Badarganj','Gangachara','Kaunia','Mithapukur','Pirgachha','Pirganj','Rangpur Sadar','Taraganj'] },
  { name: 'Dinajpur', division: 'Rangpur', upazilas: ['Birampur','Birganj','Biral','Bochaganj','Chirirbandar','Dinajpur Sadar','Fulbari','Ghoraghat','Hakimpur','Kaharole','Khansama','Nawabganj','Parbatipur'] },
  { name: 'Nilphamari', division: 'Rangpur', upazilas: ['Dimla','Domar','Jaldhaka','Kishoreganj','Nilphamari Sadar','Saidpur'] },
  { name: 'Gaibandha', division: 'Rangpur', upazilas: ['Fulchhari','Gaibandha Sadar','Gobindaganj','Palashbari','Sadullapur','Saghata','Sundarganj'] },
  { name: 'Kurigram', division: 'Rangpur', upazilas: ['Bhurungamari','Char Rajibpur','Chilmari','Kurigram Sadar','Nageshwari','Phulbari','Rajarhat','Raumari','Ulipur'] },
  { name: 'Lalmonirhat', division: 'Rangpur', upazilas: ['Aditmari','Hatibandha','Kaliganj','Lalmonirhat Sadar','Patgram'] },
  { name: 'Panchagarh', division: 'Rangpur', upazilas: ['Atwari','Boda','Debiganj','Panchagarh Sadar','Tetulia'] },
  { name: 'Thakurgaon', division: 'Rangpur', upazilas: ['Baliadangi','Haripur','Pirganj','Ranisankail','Thakurgaon Sadar'] },
];

export const DIVISIONS = [...new Set(DISTRICTS.map(d => d.division))].sort();
