#ifndef CG_PICTURE_H
#define CG_PICTURE_H
#include "lib/core/core.h"

#include <SFML/Graphics/CircleShape.hpp>
#include <SFML/Graphics/ConvexShape.hpp>
#include <SFML/Graphics/RectangleShape.hpp>
#include <cmath>
class Picture
	: public core::Drawable
	, public core::Locatable
	, public core::Draggable
{
public:
	explicit Picture(const sf::Vector2f& position, const sf::Vector2f& bounds)
		: Locatable(position)
		, m_bounds(bounds)
	{
		Build();
	}

	void SetBounds(const sf::Vector2f& bounds)
	{
		m_bounds = bounds;
		Build();
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		states.transform.translate(Position());
		for (const auto& s : m_rects)
			target.draw(s, states);
		for (const auto& s : m_convex)
			target.draw(s, states);
		for (const auto& s : m_circles)
			target.draw(s, states);
		for (const auto& s : m_segments)
			target.draw(s, states);
	}

	void OnMouseDown(sf::Vector2f mousePosition) override
	{
		if (IsInside(mousePosition))
		{
			m_isDragging = true;
			m_delta = Position() - mousePosition;
		}
	}

	void OnMouseUp(sf::Vector2f mousePosition) override
	{
		m_isDragging = false;
	}

	void OnMouseMove(sf::Vector2f mousePosition) override
	{
		if (m_isDragging && m_inWindow)
			SetPosition(mousePosition + m_delta);
	}

	void OnMouseLeave() override
	{
		m_inWindow = false;
	}

	void OnMouseEnter() override
	{
		m_inWindow = true;
	}

private:
	void Build()
	{
		m_rects.clear();
		m_convex.clear();
		m_circles.clear();
		m_segments.clear();

		const float w = m_bounds.x;
		const float h = m_bounds.y;

		const sf::Color sky(135, 206, 235);
		const sf::Color grass(60, 179, 113);
		const sf::Color house(210, 180, 140);
		const sf::Color roof(139, 69, 19);
		const sf::Color fence(205, 133, 63);
		const sf::Color windowFrame(40, 40, 40);
		const sf::Color windowGlass(180, 220, 255);
		const sf::Color white(240, 240, 240);

		AddRect(0.f, 0.f, w, h, sky);

		const float grassH = h * 0.22f;
		AddRect(0.f, h - grassH, w, grassH, grass);

		const float houseW = w * 0.46f;
		const float houseH = h * 0.36f;
		const float houseX = w * 0.18f;
		const float houseDrop = h * 0.06f;
		const float houseY = h - grassH - houseH - h * 0.05f + houseDrop;

		AddRect(houseX, houseY, houseW, houseH, house);

		const float roofOver = houseW * 0.10f;
		sf::ConvexShape roofShape;
		roofShape.setPointCount(3);
		roofShape.setPoint(0, { houseX - roofOver, houseY });
		roofShape.setPoint(
			1, { houseX + houseW * 0.5f, houseY - houseH * 0.55f });
		roofShape.setPoint(2, { houseX + houseW + roofOver, houseY });
		roofShape.setFillColor(roof);
		m_convex.push_back(roofShape);

		const float doorW = houseW * 0.16f;
		const float doorH = houseH * 0.55f;
		const float doorX = houseX + houseW * 0.68f;
		const float doorY = houseY + houseH - doorH;
		AddRect(doorX, doorY, doorW, doorH, sf::Color(120, 80, 50));
		AddRect(doorX + doorW * 0.72f, doorY + doorH * 0.55f,
			std::max(2.f, doorW * 0.10f), std::max(2.f, doorW * 0.10f),
			sf::Color(230, 210, 120));

		const float winW = houseW * 0.24f;
		const float winH = houseH * 0.30f;
		const float winX = houseX + houseW * 0.18f;
		const float winY = houseY + houseH * 0.28f;
		AddRect(winX, winY, winW, winH, windowFrame);
		AddRect(winX + winW * 0.08f, winY + winH * 0.10f, winW * 0.84f,
			winH * 0.80f, windowGlass);

		AddSegment({ winX + winW * 0.5f, winY + winH * 0.10f },
			{ winX + winW * 0.5f, winY + winH * 0.90f }, windowFrame,
			std::max(2.f, winW * 0.08f));

		AddSegment({ winX + winW * 0.08f, winY + winH * 0.5f },
			{ winX + winW * 0.92f, winY + winH * 0.5f }, windowFrame,
			std::max(2.f, winH * 0.08f));

		const float fenceY = h - grassH - h * 0.08f;
		const float fenceH = h * 0.10f;
		const float postW = std::max(2.f, w * 0.015f);
		const float gap = w * 0.035f;
		const float startX = w * 0.06f;
		const float endX = w * 0.94f;

		for (float x = startX; x <= endX; x += gap)
		{
			AddRect(x, fenceY, postW, fenceH, fence);
			sf::ConvexShape topShape;
			topShape.setPointCount(3);
			topShape.setPoint(0, { x - postW * 0.15f, fenceY });
			topShape.setPoint(1, { x + postW * 0.5f, fenceY - fenceH * 0.25f });
			topShape.setPoint(2, { x + postW * 1.15f, fenceY });
			topShape.setFillColor(fence);
			m_convex.push_back(topShape);
		}
		AddRect(startX, fenceY + fenceH * 0.35f, endX - startX,
			std::max(2.f, fenceH * 0.18f), fence);

		const float cloudY = h * 0.12f;
		const float cloudH = h * 0.10f;
		const float cloudW = w * 0.18f;
		const float cx = w * 0.68f;
		AddCircle(cx + cloudW * 0.15f, cloudY + cloudH * 0.55f, cloudH * 0.35f,
			white);
		AddCircle(cx + cloudW * 0.40f, cloudY + cloudH * 0.40f, cloudH * 0.45f,
			white);
		AddCircle(cx + cloudW * 0.65f, cloudY + cloudH * 0.58f, cloudH * 0.33f,
			white);

		const float sunR = std::min(w, h) * 0.06f;
		AddCircle(
			w * 0.10f + sunR, h * 0.08f + sunR, sunR, sf::Color(255, 215, 0));
	}

	[[nodiscard]] bool IsInside(sf::Vector2f point) const
	{
		return point.x >= Position().x && point.x <= Position().x + m_bounds.x
			&& point.y >= Position().y && point.y <= Position().y + m_bounds.y;
	}

	void AddRect(float x, float y, float w, float h, sf::Color c)
	{
		sf::RectangleShape s({ w, h });
		s.setPosition({ x, y });
		s.setFillColor(c);
		m_rects.push_back(s);
	}

	void AddCircle(float cx, float cy, float r, sf::Color c)
	{
		sf::CircleShape s(r);
		s.setFillColor(c);
		s.setPosition({ cx - r, cy - r });
		m_circles.push_back(s);
	}

	void AddSegment(
		sf::Vector2f a, sf::Vector2f b, sf::Color c, float thickness)
	{
		const sf::Vector2f d = b - a;
		const float len = std::sqrt(d.x * d.x + d.y * d.y);
		if (len <= 0.0001f)
			return;

		sf::RectangleShape s({ len, thickness });
		s.setPosition(a);
		s.setFillColor(c);
		s.setOrigin(0.f, thickness * 0.5f);
		s.setRotation(std::atan2(d.y, d.x) * 180.f / 3.1415926535f);
		m_segments.push_back(s);
	}

private:
	sf::Vector2f m_bounds{};
	sf::Vector2f m_delta{};
	bool m_isDragging = false;
	bool m_inWindow = false;

	std::vector<sf::RectangleShape> m_rects;
	std::vector<sf::ConvexShape> m_convex;
	std::vector<sf::CircleShape> m_circles;
	std::vector<sf::RectangleShape> m_segments;
};

#endif // CG_PICTURE_H
