"use client";

import React, { useRef, useState, useEffect } from "react";
import { Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";

interface ProductImageSliderProps {
  images?: string[];
  maxThumbs?: number; // hiển thị bao nhiêu thumbnail (mặc định 6)
}

const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images = [],
  maxThumbs = 6,
}) => {
  const carouselRef = useRef<CarouselRef | null>(null);
  const [current, setCurrent] = useState(0);

  // nếu images thay đổi, reset index nếu cần
  useEffect(() => {
    if (images.length === 0) setCurrent(0);
    if (current >= images.length) setCurrent(0);
  }, [images, current]);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-2">
      <b>Ảnh sản phẩm:</b>

      {/* Ảnh chính (slider) */}
      <div className="mt-2 rounded overflow-hidden">
        <Carousel
          ref={carouselRef}
          afterChange={(idx) => setCurrent(idx)}
          dots={false}
          draggable
        >
          {images.map((img, i) => (
            <div
              key={i}
              className="flex justify-center items-center bg-gray-50"
              style={{ height: 360 }} // điều chỉnh chiều cao ảnh chính
            >
              <img
                src={img}
                alt={`img-${i}`}
                className="max-h-[360px] object-contain mx-auto"
              />
            </div>
          ))}
        </Carousel>
      </div>

      {/* Thumbnails */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        {images.slice(0, maxThumbs).map((img, i) => (
          <button
            key={i}
            onClick={() => carouselRef.current?.goTo(i, false)}
            className={`w-20 h-20 rounded overflow-hidden border flex-shrink-0 focus:outline-none transition-transform ${
              current === i
                ? "ring-2  transform scale-105"
                : "border-gray-200 hover:opacity-90"
            }`}
          >
            <img
              src={img}
              alt={`thumb-${i}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}

        {/* nếu còn ảnh nữa, show +N */}
        {images.length > maxThumbs && (
          <div className="ml-2 text-sm text-gray-600 flex items-center">
            +{images.length - maxThumbs} ảnh
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageSlider;
