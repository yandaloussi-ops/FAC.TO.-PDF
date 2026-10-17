import React, { useState } from 'react';
import { Book } from '../types';
import { BookOpen, Lock, CheckCircle2, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { generateDefaultCoverSvg } from '../utils/storage';

interface BookCardProps {
  book: Book;
  isAcquired: boolean;
  onOpenDetails: (book: Book) => void;
  onOpenReader: (book: Book) => void;
  onQuickBuy?: (book: Book) => void;
  isVisitorMode?: boolean;
  lang: 'fr' | 'ar';
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  isAcquired,
  onOpenDetails,
  onOpenReader,
  onQuickBuy,
  isVisitorMode = false,
  lang,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(
    book.coverImage || generateDefaultCoverSvg(book.title, book.author, book.faculty)
  );

  // If visitor mode is active, display the visitor public price (or 1.5x subsidized price)
  const effectivePrice = isVisitorMode
    ? book.publicPriceMAD || (book.isFree ? 0 : Math.round(book.priceMAD * 1.5))
    : book.priceMAD;

  const handleCoverClick = () => {
    if (isAcquired) {
      onOpenReader(book);
    } else if (onQuickBuy) {
      onQuickBuy(book);
    } else {
      onOpenDetails(book);
    }
  };

  return (
    <div className="group flex flex-col bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Book Cover Area — Acts directly as the interactive portal & link to purchase or read */}
      <div
        onClick={handleCoverClick}
        className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer flex items-center justify-center group/cover"
        title={
          isAcquired
            ? (lang === 'fr' ? 'Cliquez pour lire dans le lecteur sécurisé' : 'انقر للمطالعة داخل القارئ المشفر')
            : (lang === 'fr' ? 'Accéder au cours (Tarif préférentiel étudiant)' : 'انقر للاقتناء بالتعريفة التفضيلية المخصصة للطلبة')
        }
      >
        <img
          src={imgSrc}
          alt={book.title}
          onError={() => {
            setImgSrc(generateDefaultCoverSvg(book.title, book.author, book.faculty));
          }}
          className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3 text-center">
          {isAcquired ? (
            <span className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Ouvrir le Cours' : 'فتح المقرر'}</span>
            </span>
          ) : (
            <span className="bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'fr' ? 'Tarif Préférentiel' : 'التعريفة التفضيلية'}</span>
            </span>
          )}
        </div>

        {/* Overlay DRM marker */}
        <div className="absolute top-2.5 right-2.5">
          {isAcquired ? (
            <span className="flex items-center gap-1 bg-emerald-900/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>{lang === 'fr' ? 'Mémorisé' : 'مقتنى'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-stone-900/85 backdrop-blur-xs text-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm border border-stone-700">
              <Lock className="w-3 h-3 text-amber-300" />
              <span>{lang === 'fr' ? 'Licence In-App' : 'رخصة مشفرة'}</span>
            </span>
          )}
        </div>

        {/* Visitor / Student pricing badge on cover */}
        {isVisitorMode && !book.isFree && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="bg-amber-500/90 backdrop-blur-xs text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
              {lang === 'fr' ? 'Tarif Visiteur' : 'تعريفة الزوار'}
            </span>
          </div>
        )}
      </div>

      {/* Book Meta & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
            <span className="font-semibold text-stone-700 truncate max-w-[130px]">{book.facultyLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{book.semester}</span>
            <span aria-hidden="true">·</span>
            <span>{book.totalPages} {lang === 'fr' ? 'pages' : 'ص'}</span>
          </div>

          {(book.specialty || book.module) && (
            <div className="flex flex-wrap items-center gap-1 mb-1.5">
              {book.specialty && (
                <span className="text-[9.5px] font-bold text-amber-900 bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-200/80 truncate max-w-[180px]" title={book.specialty}>
                  {lang === 'ar' && book.specialtyAr ? book.specialtyAr : book.specialty}
                </span>
              )}
              {book.module && (
                <span className="text-[9.5px] font-semibold text-emerald-900 bg-emerald-50/90 px-1.5 py-0.5 rounded border border-emerald-200/80 truncate max-w-[180px]" title={book.module}>
                  {lang === 'ar' && book.moduleAr ? book.moduleAr : book.module}
                </span>
              )}
            </div>
          )}

          <h3
            onClick={() => onOpenDetails(book)}
            className="text-sm font-bold text-stone-900 line-clamp-2 hover:text-amber-800 transition-colors cursor-pointer leading-snug mb-1"
            title={lang === 'ar' && book.titleAr ? book.titleAr : book.title}
          >
            {lang === 'ar' && book.titleAr ? book.titleAr : book.title}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-1 mb-3">
            {book.author} · {book.university}
          </p>
        </div>

        {/* Action and Price footer */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            {book.isFree ? (
              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {lang === 'fr' ? 'Gratuit' : 'مجاني'}
              </span>
            ) : (
              <div className="flex flex-col">
                <div className="text-stone-950 font-black text-sm tabular-nums flex items-baseline gap-1">
                  <span>{effectivePrice}</span>
                  <span className="text-xs font-semibold text-stone-500">
                    {lang === 'fr' ? 'DH' : 'درهم'}
                  </span>
                </div>
                {isVisitorMode ? (
                  <span className="text-[10px] text-amber-700 font-semibold">
                    {lang === 'fr' ? 'Tarif public visiteur' : 'سعر العموم غير مدعوم'}
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {lang === 'fr' ? 'Tarif étudiant subventionné' : 'سعر مدعوم للطلبة'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isAcquired ? (
              <button
                type="button"
                onClick={() => onOpenReader(book)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'fr' ? 'Lire' : 'قراءة'}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenDetails(book)}
                  className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  title={lang === 'fr' ? 'Détails & Sommaire' : 'تفاصيل وفهرس'}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCoverClick}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'fr' ? 'Acquérir' : 'اقتناء'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
