import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export const createSampleBlogData = async () => {
  try {
    // Sample categories
    const categories = [
      {
        name: 'QR Code Tips',
        slug: 'qr-code-tips',
        description: 'Tips and tricks for creating effective QR codes',
        color: 'blue'
      },
      {
        name: 'Digital Marketing',
        slug: 'digital-marketing', 
        description: 'Digital marketing strategies and trends',
        color: 'green'
      },
      {
        name: 'Business Tools',
        slug: 'business-tools',
        description: 'Essential tools for modern businesses',
        color: 'purple'
      }
    ];

    // Add categories
    for (const category of categories) {
      await addDoc(collection(db, 'blog_categories'), category);
    }

    // Sample blog posts
    const posts = [
      {
        title: '10 Creative Ways to Use QR Codes in Your Business',
        slug: '10-creative-ways-use-qr-codes-business',
        excerpt: 'Discover innovative applications of QR codes that can boost your business engagement and streamline customer interactions.',
        content: `QR codes have evolved far beyond simple website links. Today's businesses are finding creative ways to integrate QR codes into their marketing strategies, customer service, and operational workflows.

Here are 10 innovative ways to use QR codes in your business:

1. **Interactive Business Cards**
Create dynamic business cards with QR codes that link to your digital portfolio, LinkedIn profile, or a custom landing page with all your contact information.

2. **Menu and Product Information**
Restaurants and retail stores can use QR codes to provide detailed product information, ingredients, pricing, and even customer reviews.

3. **Event Registration and Check-ins**
Streamline event management by using QR codes for quick registration, check-ins, and access to event materials.

4. **Customer Feedback Collection**
Place QR codes on receipts, packaging, or in-store displays to easily collect customer feedback and reviews.

5. **Social Media Integration**
Create QR codes that direct customers to your social media profiles, encouraging followers and engagement.

6. **Promotional Campaigns**
Use QR codes in print advertisements, flyers, and posters to track campaign effectiveness and drive digital engagement.

7. **Inventory Management**
Implement QR codes for internal inventory tracking, equipment management, and supply chain optimization.

8. **Digital Loyalty Programs**
Replace physical loyalty cards with QR code-based digital programs that customers can access from their smartphones.

9. **Training and Documentation**
Provide employees with QR codes linking to training materials, safety procedures, and operational guidelines.

10. **Payment Processing**
Integrate QR codes with payment systems for contactless transactions and simplified checkout processes.

The key to successful QR code implementation is ensuring they provide genuine value to your customers while solving real business challenges. Always test your QR codes across different devices and include clear instructions for users.`,
        author: 'ToolzHub Team',
        publishedAt: '2025-08-15T10:00:00Z',
        updatedAt: '2025-08-15T10:00:00Z',
        tags: ['QR Codes', 'Business Strategy', 'Marketing', 'Innovation'],
        category: 'QR Code Tips',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80',
        readTime: 8,
        seo: {
          title: '10 Creative QR Code Ideas for Business Growth | ToolzHub',
          description: 'Discover 10 innovative ways to use QR codes in your business. From interactive business cards to digital loyalty programs, boost engagement today.',
          keywords: 'QR code business ideas, creative QR codes, business QR code strategies, digital marketing'
        }
      },
      {
        title: 'QR Code Best Practices: Design and Placement Tips',
        slug: 'qr-code-best-practices-design-placement',
        excerpt: 'Learn essential design principles and placement strategies to maximize QR code effectiveness and user engagement.',
        content: `Creating effective QR codes goes beyond just generating the code itself. The design, placement, and user experience are crucial factors that determine whether your QR codes will be successful.

**Design Best Practices:**

**Size Matters**
QR codes should be large enough to scan easily. The minimum recommended size is 2x2 cm (0.8x0.8 inches) for print materials. For digital displays, ensure the code is clearly visible from the intended viewing distance.

**Contrast is Key**
Maintain high contrast between the QR code and its background. Dark codes on light backgrounds work best. Avoid low-contrast color combinations that make scanning difficult.

**Quiet Zone Requirements**
Always include a "quiet zone" - a clear border around the QR code. This white space should be at least 4 modules wide on all sides to ensure reliable scanning.

**Testing Across Devices**
Test your QR codes on different smartphones, in various lighting conditions, and from different angles. What works on one device might not work on another.

**Placement Strategies:**

**Eye-Level Positioning**
Place QR codes at eye level when possible. This makes them more noticeable and easier to scan without awkward positioning.

**Contextual Placement**
Position QR codes near relevant content. If the code links to product information, place it near the product display.

**Call-to-Action**
Always include clear instructions like "Scan for menu," "Get exclusive offers," or "View product details." Don't assume users know what the QR code does.

**Multiple Touchpoints**
Consider placing QR codes at multiple locations throughout the customer journey - on packaging, receipts, displays, and marketing materials.

**Technical Considerations:**

**Error Correction**
Use appropriate error correction levels. Higher levels allow the code to function even if partially damaged but require larger code sizes.

**URL Optimization**
Use short, clean URLs for better code simplicity and faster loading times. Consider using URL shorteners for long links.

**Analytics Integration**
Implement tracking to measure QR code performance. This data helps optimize placement and design decisions.

Following these best practices ensures your QR codes provide a smooth user experience while achieving your business objectives.`,
        author: 'Digital Marketing Team',
        publishedAt: '2025-08-12T14:30:00Z',
        updatedAt: '2025-08-12T14:30:00Z',
        tags: ['QR Codes', 'Design', 'Best Practices', 'User Experience'],
        category: 'QR Code Tips',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1586953135161-e6df4e9a3e52?w=800&q=80',
        readTime: 6
      },
      {
        title: 'The Future of Digital Marketing: Trends to Watch in 2025',
        slug: 'future-digital-marketing-trends-2025',
        excerpt: 'Explore the emerging digital marketing trends that will shape business strategies in 2025 and beyond.',
        content: `Digital marketing continues to evolve at a rapid pace, driven by technological advancements, changing consumer behaviors, and new platforms. As we move through 2025, several key trends are reshaping how businesses connect with their audiences.

**AI-Powered Personalization**
Artificial intelligence is becoming more sophisticated in analyzing customer data and delivering personalized experiences. From chatbots to content recommendations, AI helps businesses provide relevant, timely interactions that increase engagement and conversions.

**Interactive Content Dominance**
Static content is giving way to interactive experiences. QR codes, augmented reality (AR), polls, quizzes, and interactive videos are becoming essential tools for engagement.

**Voice Search Optimization**
With smart speakers and voice assistants becoming ubiquitous, optimizing for voice search is crucial. This means focusing on conversational keywords and featured snippet optimization.

**Sustainability Marketing**
Consumers increasingly prefer brands that demonstrate environmental responsibility. Marketing strategies now emphasize sustainability, ethical practices, and social impact.

**Privacy-First Approach**
With increased privacy regulations and consumer awareness, businesses are adopting privacy-first marketing strategies. This includes transparent data practices and consent-based marketing.

**Omnichannel Integration**
Seamless experiences across all touchpoints - online, offline, mobile, and social - are becoming the standard. QR codes play a crucial role in bridging physical and digital experiences.

**Video-First Content Strategy**
Video content continues to dominate, with short-form videos, live streaming, and interactive video experiences driving the highest engagement rates.

**Community Building**
Brands are focusing on building communities rather than just collecting followers. This involves creating spaces for meaningful interactions and user-generated content.

**Micro-Influencer Partnerships**
Authentic partnerships with micro-influencers are proving more effective than celebrity endorsements, offering better ROI and genuine audience connections.

**Data-Driven Decision Making**
Advanced analytics and real-time data are enabling more precise targeting and campaign optimization. Businesses are investing in tools that provide actionable insights.

The key to success in 2025's digital landscape is adaptability, authenticity, and a focus on providing genuine value to customers through every interaction.`,
        author: 'Marketing Strategy Team',
        publishedAt: '2025-08-10T09:15:00Z',
        updatedAt: '2025-08-10T09:15:00Z',
        tags: ['Digital Marketing', 'Trends', '2025', 'Strategy', 'Technology'],
        category: 'Digital Marketing',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        readTime: 7
      }
    ];

    // Add blog posts
    for (const post of posts) {
      await addDoc(collection(db, 'blog_posts'), {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Sample blog data created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample blog data:', error);
    return false;
  }
};
