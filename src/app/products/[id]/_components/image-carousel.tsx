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
    <Carousel className="w-full">
      <CarouselContent>
        {images.map((src, index) => (
          <CarouselItem key={index}>
            <div className="aspect-video overflow-hidden rounded-lg border border-border">
              <Image
                src={src}
                alt={`${productName} image ${index + 1}`}
                width={600}
                height={400}
                className="h-full w-full object-cover"
                data-ai-hint="product image"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
