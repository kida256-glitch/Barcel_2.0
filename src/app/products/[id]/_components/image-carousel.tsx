'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ImageCarouselProps {
  images: string[];
  productName: string;
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
  return (
    <Carousel className="w-full perspective-1000">
      <CarouselContent className="transform-3d">
        {images.map((src, index) => (
          <CarouselItem key={index} className="animate-slide-in-3d" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="aspect-video overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-2xl shadow-primary/10 group perspective-1000">
              <div className="relative h-full w-full transform-3d transition-all duration-700 group-hover:scale-105 group-hover:rotate-1">
                <Image
                  src={src}
                  alt={`${productName} image ${index + 1}`}
                  width={600}
                  height={400}
                  className="h-full w-full object-cover transition-transform duration-700"
                  data-ai-hint="product image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30" />
      <CarouselNext className="right-2 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30" />
    </Carousel>
  );
}
