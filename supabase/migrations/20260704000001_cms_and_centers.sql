-- 1. How to Reach Destination
CREATE TABLE IF NOT EXISTS public.temple_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    google_maps_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial destination
INSERT INTO public.temple_destinations (name, latitude, longitude, google_maps_url)
VALUES ('Shree Khatu Shyam Ji Temple', 27.36965159, 75.39855581, 'https://www.google.com/maps/dir/?api=1&destination=Shree+Khatu+Shyam+Ji+Temple+Khatu')
ON CONFLICT DO NOTHING;

-- 2. Travel Options
CREATE TABLE IF NOT EXISTS public.travel_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    detail TEXT NOT NULL,
    detail_hi TEXT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial travel options
INSERT INTO public.travel_options (mode, icon, detail, detail_hi, display_order, is_active)
VALUES 
('By Road', 'CarFront', 'Khatu is 80 km from Jaipur via NH-148D. Well-connected by taxi & private cars.', 'खाटू जयपुर से एनएच-148डी होकर 80 किमी दूर है। टैक्सी और निजी कारों से अच्छी तरह जुड़ा हुआ है।', 1, true),
('By Train', 'TrainFront', 'Nearest station: Reengus Junction (17 km). Ample taxis & autos available.', 'निकटतम स्टेशन: रींगस जंक्शन (17 किमी)। पर्याप्त टैक्सियाँ और ऑटो उपलब्ध हैं।', 2, true),
('By Bus', 'BusFront', 'Regular RSRTC & Shyam buses from Jaipur, Sikar & Delhi to Khatu Dham.', 'जयपुर, सीकर और दिल्ली से खाटू धाम के लिए नियमित आरएसआरटीसी और श्याम बसें।', 3, true),
('Parking', 'SquareParking', '3 large lots (A, B, C) with free shuttle service to the main temple gate.', 'मुख्य मंदिर के गेट के लिए मुफ्त शटल सेवा के साथ 3 बड़े पार्किंग स्थल (ए, बी, सी)।', 4, true)
ON CONFLICT DO NOTHING;

-- 3. Route Information
CREATE TABLE IF NOT EXISTS public.route_information (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    distance VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial route information
INSERT INTO public.route_information (title, distance, duration, description, is_active)
VALUES ('Jaipur to Khatu Dham', '80 km', '2 hours', 'NH-52 to Reengus, then take the state highway to Khatu.', true)
ON CONFLICT DO NOTHING;

-- 4. Transport Instructions
CREATE TABLE IF NOT EXISTS public.transport_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    instructions TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial transport instructions
INSERT INTO public.transport_instructions (title, instructions, is_active)
VALUES ('General Guidelines', 'Please start early during Ekadashi to avoid heavy traffic on Ringas-Khatu road.', true)
ON CONFLICT DO NOTHING;

-- 5. Aarti Timings
CREATE TABLE IF NOT EXISTS public.aarti_timings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NULL,
    start_time VARCHAR(20) NOT NULL,
    end_time VARCHAR(20) NULL,
    description TEXT NULL,
    description_hi TEXT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial Aarti timings
INSERT INTO public.aarti_timings (name, name_hi, start_time, status, display_order)
VALUES 
('Mangla Aarti', 'मंगला आरती', '4:30 AM', 'active', 1),
('Shringaar Aarti', 'श्रृंगार आरती', '7:00 AM', 'active', 2),
('Bhog Aarti', 'भोग आरती', '12:30 PM', 'active', 3),
('Sandhya Aarti', 'संध्या आरती', '7:30 PM', 'active', 4)
ON CONFLICT DO NOTHING;

-- 6. Devotee Guidelines
CREATE TABLE IF NOT EXISTS public.devotee_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    title_hi VARCHAR(150) NULL,
    content TEXT NOT NULL,
    content_hi TEXT NULL,
    status VARCHAR(20) DEFAULT 'published' NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial devotee guidelines
INSERT INTO public.devotee_guidelines (title, title_hi, content, content_hi, display_order, status)
VALUES 
('Sanctum Mobile Policy', 'गर्भगृह मोबाइल नीति', 'Mobile phones are strictly prohibited inside the inner sanctum.', 'गर्भगृह के अंदर मोबाइल फोन पूरी तरह से प्रतिबंधित हैं।', 1, 'published'),
('ID Proof Requirement', 'आईडी प्रूफ की आवश्यकता', 'Carry a valid government ID for all visitors listed.', 'सूचीबद्ध सभी आगंतुकों के लिए एक वैध सरकारी आईडी साथ रखें।', 2, 'published'),
('Reporting Time', 'पहुंचने का समय', 'Reach the temple 30 mins before your slot time.', 'अपने स्लॉट समय से 30 मिनट पहले मंदिर पहुंचें।', 3, 'published')
ON CONFLICT DO NOTHING;

-- 7. Temple CMS History Logs
CREATE TABLE IF NOT EXISTS public.temple_cms_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_type VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    updated_by VARCHAR(150) NOT NULL,
    updated_time TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    previous_value JSONB NULL,
    current_value JSONB NULL
);

-- 8. Offline Booking Centers
CREATE TABLE IF NOT EXISTS public.offline_booking_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    google_maps_url TEXT NOT NULL,
    working_hours VARCHAR(150) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Seed initial offline centers
INSERT INTO public.offline_booking_centers (name, address, district, state, latitude, longitude, google_maps_url, working_hours, description, status)
VALUES 
('Jaipur Central Booking Center', 'Main Ticket Hall, Jaipur Railway Station', 'Jaipur', 'Rajasthan', 26.9196236, 75.7878345, 'https://maps.google.com/?q=26.9196236,75.7878345', '08:00 AM - 08:00 PM', 'Convenient booking center located inside Jaipur Railway Station.', 'active'),
('Reengus Junction Center', 'Near Exit Gate 1, Reengus Railway Station', 'Sikar', 'Rajasthan', 27.361849, 75.568453, 'https://maps.google.com/?q=27.361849,75.568453', '06:00 AM - 10:00 PM', 'Closest offline center before reaching Khatu Dham.', 'active')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.temple_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aarti_timings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devotee_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_cms_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_booking_centers ENABLE ROW LEVEL SECURITY;

-- 1. Policies for temple_destinations
CREATE POLICY dest_select ON public.temple_destinations FOR SELECT USING (true);
CREATE POLICY dest_all ON public.temple_destinations FOR ALL USING (public.is_admin());

-- 2. Policies for travel_options
CREATE POLICY opt_select ON public.travel_options FOR SELECT USING (true);
CREATE POLICY opt_all ON public.travel_options FOR ALL USING (public.is_admin());

-- 3. Policies for route_information
CREATE POLICY route_select ON public.route_information FOR SELECT USING (true);
CREATE POLICY route_all ON public.route_information FOR ALL USING (public.is_admin());

-- 4. Policies for transport_instructions
CREATE POLICY instr_select ON public.transport_instructions FOR SELECT USING (true);
CREATE POLICY instr_all ON public.transport_instructions FOR ALL USING (public.is_admin());

-- 5. Policies for aarti_timings
CREATE POLICY aarti_select ON public.aarti_timings FOR SELECT USING (true);
CREATE POLICY aarti_all ON public.aarti_timings FOR ALL USING (public.is_admin());

-- 6. Policies for devotee_guidelines
CREATE POLICY guide_select ON public.devotee_guidelines FOR SELECT USING (true);
CREATE POLICY guide_all ON public.devotee_guidelines FOR ALL USING (public.is_admin());

-- 7. Policies for temple_cms_history
CREATE POLICY hist_select ON public.temple_cms_history FOR SELECT USING (public.is_admin());
CREATE POLICY hist_insert ON public.temple_cms_history FOR INSERT WITH CHECK (public.is_admin());

-- 8. Policies for offline_booking_centers
CREATE POLICY cent_select ON public.offline_booking_centers FOR SELECT USING (true);
CREATE POLICY cent_all ON public.offline_booking_centers FOR ALL USING (public.is_admin());
